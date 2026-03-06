const crypto = require('node:crypto');
const { EmbedBuilder } = require('discord.js');

const User = require('../models/User');
const XPLog = require('../models/XPLog');
const { config } = require('../config');
const streakService = require('./streakService');
const levelService = require('./levelService');
const weeklyService = require('./weeklyService');
const milestoneService = require('./milestoneService');
const logger = require('../utils/logger');

class XPService {
  // Ensures user documents exist for all XP-related operations.
  async getOrCreateUser(guildId, userId) {
    try {
      return await User.findOneAndUpdate(
        { guildId, userId },
        { $setOnInsert: { guildId, userId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      return User.findOne({ guildId, userId });
    }
  }

  normalizeMessageContent(content) {
    return content.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  hashMessageContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async logXpAction(payload) {
    const {
      guildId,
      userId,
      amount,
      type,
      reason,
      actorId = null,
      metadata = {}
    } = payload;

    await XPLog.create({
      guildId,
      userId,
      actorId,
      amount,
      type,
      reason,
      metadata
    });
  }

  async processMessage(message) {
    // Foundation XP pipeline: validation -> anti-spam checks -> streak update -> XP award.
    if (!message.guild || message.author.bot) {
      return { awarded: false, reason: 'ignored' };
    }

    const rawContent = (message.content || '').trim();
    if (rawContent.length < config.xp.minMessageLength) {
      return { awarded: false, reason: 'short_message' };
    }

    const normalized = this.normalizeMessageContent(rawContent);
    const messageHash = this.hashMessageContent(normalized);

    const userDoc = await this.getOrCreateUser(message.guild.id, message.author.id);
    if (!userDoc) {
      return { awarded: false, reason: 'user_not_found' };
    }

    if (userDoc.lastMessageHash === messageHash) {
      return { awarded: false, reason: 'duplicate_message' };
    }

    const now = new Date();
    streakService.applyActivity(userDoc, now);

    userDoc.lastMessageHash = messageHash;
    userDoc.messageCount += 1;

    await weeklyService.incrementStats({
      guildId: message.guild.id,
      userId: message.author.id,
      messageDelta: 1
    });

    const inCooldown = userDoc.lastXpAt && (now.getTime() - userDoc.lastXpAt.getTime()) < config.xp.cooldownMs;
    if (inCooldown) {
      await userDoc.save();
      return { awarded: false, reason: 'cooldown' };
    }

    const streakMultiplier = streakService.getMultiplier(userDoc.dailyStreak);
    const baseXp = config.xp.messageAmount;
    const xpAwarded = Math.max(1, Math.round(baseXp * streakMultiplier));

    const previousXp = userDoc.xp;
    const previousMessages = userDoc.messageCount;

    userDoc.xp += xpAwarded;
    userDoc.lastXpAt = now;

    await levelService.syncUserLevel({
      member: message.member,
      userDoc,
      announceChannel: message.channel,
      announceLevelUp: true
    });

    await userDoc.save();

    // Check for milestones
    const messageMilestone = milestoneService.checkMessageMilestone(previousMessages, userDoc.messageCount);
    const xpMilestone = milestoneService.checkXpMilestone(previousXp, userDoc.xp);
    const levelMilestone = milestoneService.checkLevelMilestone(userDoc.level);

    if (messageMilestone.reached || xpMilestone.reached || levelMilestone.reached) {
      const milestone = messageMilestone.reached ? messageMilestone : xpMilestone.reached ? xpMilestone : levelMilestone;
      
      let typeIndicator = '';
      let color = 0x6CD7E6;
      
      if (milestone.type === 'messages') {
        typeIndicator = '💬 **Message Count Milestone**';
        color = 0x5865F2;
      } else if (milestone.type === 'xp') {
        typeIndicator = '⚡ **Experience Milestone**';
        color = 0x57F287;
      } else if (milestone.type === 'level') {
        typeIndicator = '🏆 **Level Achievement**';
        color = 0xFAA61A;
      }
      
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${milestone.emoji} ${milestone.title}`)
        .setDescription(`<@${message.author.id}> ${milestone.description}`)
        .addFields(
          { name: '📊 Achievement Type', value: typeIndicator, inline: false },
          { name: '🎯 Milestone Value', value: `**${milestone.value}** ${milestone.type}`, inline: true }
        )
        .setFooter({ text: 'Keep up the amazing work! 🎉' })
        .setTimestamp();
      
      try {
        await message.channel.send({ embeds: [embed] });
      } catch (error) {
        logger.warn('Failed to send milestone announcement', {
          guildId: message.guild.id,
          userId: message.author.id,
          milestone: milestone.type,
          error: error.message
        });
      }
    }

    // Visual feedback: React to message with checkmark (subtle confirmation)
    if (Math.random() < 0.1) { // Only 10% of the time to avoid spam
      await message.react('✅').catch(() => null);
    }

    await this.logXpAction({
      guildId: message.guild.id,
      userId: message.author.id,
      amount: xpAwarded,
      type: 'message',
      reason: 'Meaningful message XP',
      metadata: {
        baseXp,
        streakMultiplier,
        streak: userDoc.dailyStreak
      }
    });

    await weeklyService.incrementStats({
      guildId: message.guild.id,
      userId: message.author.id,
      xpDelta: xpAwarded
    });

    return {
      awarded: true,
      amount: xpAwarded,
      totalXp: userDoc.xp,
      level: userDoc.level,
      streak: userDoc.dailyStreak
    };
  }

  async applyXpChange(payload) {
    // Unified XP mutator for admin actions, challenge rewards, and attendance rewards.
    const {
      guildId,
      userId,
      amount,
      type,
      reason,
      actorId = null,
      metadata = {},
      member = null,
      announceChannel = null,
      announceLevelUp = true,
      touchActivity = false,
      applyStreakMultiplier = false,
      countTowardsWeekly = true
    } = payload;

    if (!guildId || !userId) {
      throw new Error('guildId and userId are required for XP updates');
    }

    if (!Number.isFinite(amount) || amount === 0) {
      throw new Error('amount must be a non-zero number');
    }

    const userDoc = await this.getOrCreateUser(guildId, userId);
    if (!userDoc) {
      throw new Error('Failed to load user for XP update');
    }

    const now = new Date();
    if (touchActivity) {
      streakService.applyActivity(userDoc, now);
    }

    let effectiveAmount = amount;
    let streakMultiplier = 1;

    if (amount > 0 && applyStreakMultiplier) {
      streakMultiplier = streakService.getMultiplier(userDoc.dailyStreak);
      effectiveAmount = Math.max(1, Math.round(amount * streakMultiplier));
    }

    const previousXp = userDoc.xp;
    userDoc.xp = Math.max(0, userDoc.xp + effectiveAmount);
    const appliedDelta = userDoc.xp - previousXp;

    if (appliedDelta > 0) {
      userDoc.lastXpAt = now;
    }

    await levelService.syncUserLevel({
      member,
      userDoc,
      announceChannel,
      announceLevelUp
    });

    await userDoc.save();

    if (appliedDelta !== 0) {
      await this.logXpAction({
        guildId,
        userId,
        amount: appliedDelta,
        type,
        reason,
        actorId,
        metadata: {
          ...metadata,
          requestedAmount: amount,
          effectiveAmount,
          streakMultiplier,
          streak: userDoc.dailyStreak
        }
      });

      if (countTowardsWeekly) {
        await weeklyService.incrementStats({ guildId, userId, xpDelta: appliedDelta });
      }
    }

    return {
      userDoc,
      previousXp,
      newXp: userDoc.xp,
      appliedDelta,
      streak: userDoc.dailyStreak,
      level: userDoc.level
    };
  }
}

module.exports = new XPService();
