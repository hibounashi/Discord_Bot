const { EmbedBuilder } = require('discord.js');
const { levelRoles } = require('../config/roles');
const roleLogService = require('./roleLogService');
const milestoneService = require('./milestoneService');
const logger = require('../utils/logger');

class LevelService {
  // Requirement formula: XP required = 100 * (level ^ 1.5)
  xpRequiredForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  calculateLevelFromXp(xp) {
    let level = 0;

    while (xp >= this.xpRequiredForLevel(level + 1)) {
      level += 1;
    }

    return level;
  }

  getTargetLevelRoleName(level) {
    const sorted = [...levelRoles].sort((a, b) => a.minLevel - b.minLevel);
    let targetRoleName = null;

    for (const role of sorted) {
      if (level >= role.minLevel) {
        targetRoleName = role.name;
      }
    }

    return targetRoleName;
  }

  async syncLevelRoles(member, level) {
    // Keep exactly one level role assigned by removing old level tiers first.
    if (!member || !member.guild) {
      logger.error('syncLevelRoles: Missing member or guild', { memberId: member?.id, guildId: member?.guild?.id });
      return;
    }

    const guild = member.guild;
    const targetRoleName = this.getTargetLevelRoleName(level);
    const managedLevelRoleNames = new Set(levelRoles.map((role) => role.name));

    logger.info('Syncing level roles', {
      guildId: guild.id,
      userId: member.id,
      level,
      targetRoleName
    });

    const rolesToRemove = member.roles.cache.filter((role) => managedLevelRoleNames.has(role.name));

    for (const role of rolesToRemove.values()) {
      if (role.name !== targetRoleName) {
        try {
          await member.roles.remove(role, 'Level role replaced');

          await roleLogService.logRoleChange(guild, {
            userId: member.id,
            roleName: role.name,
            action: 'removed',
            reason: 'Level role replaced by new level role',
            source: 'level_system'
          });
        } catch (error) {
          logger.error('Failed to remove old level role', {
            guildId: guild.id,
            userId: member.id,
            roleName: role.name,
            error: error.message
          });
        }
      }
    }

    if (!targetRoleName) {
      logger.warn('No target role name found for level', { level, guildId: guild.id });
      return;
    }

    const targetRole = guild.roles.cache.find((role) => role.name === targetRoleName);
    if (!targetRole) {
      logger.error('Target level role not found in guild', {
        guildId: guild.id,
        targetRoleName,
        level,
        availableRoles: guild.roles.cache.map(r => r.name).slice(0, 20)
      });
      return;
    }

    if (!member.roles.cache.has(targetRole.id)) {
      try {
        await member.roles.add(targetRole, 'Level role assignment');

        logger.info('Successfully assigned level role', {
          guildId: guild.id,
          userId: member.id,
          roleName: targetRole.name,
          level
        });

        await roleLogService.logRoleChange(guild, {
          userId: member.id,
          roleName: targetRole.name,
          action: 'assigned',
          reason: `Reached level ${level}`,
          source: 'level_system'
        });
      } catch (error) {
        logger.error('Failed to assign level role', {
          guildId: guild.id,
          userId: member.id,
          roleName: targetRole.name,
          level,
          error: error.message
        });
      }
    }
  }

  async syncUserLevel(payload) {
    // Detects level-up/level-down after XP change and applies role automation.
    const {
      member,
      userDoc,
      announceChannel = null,
      announceLevelUp = true
    } = payload;

    const previousLevel = userDoc.level;
    const newLevel = this.calculateLevelFromXp(userDoc.xp);

    if (newLevel === previousLevel) {
      return {
        changed: false,
        previousLevel,
        newLevel
      };
    }

    userDoc.level = newLevel;
    await this.syncLevelRoles(member, newLevel);

    // Announce every level-up
    const shouldAnnounce = announceLevelUp && announceChannel && newLevel > previousLevel;
    
    if (shouldAnnounce) {
      const milestone = milestoneService.checkLevelMilestone(newLevel);
      const isMajorMilestone = milestone.reached;
      
      const color = isMajorMilestone ? 0xFAA61A : 0x6CD7E6;
      
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(isMajorMilestone ? `🏆 ${milestone.title}` : '🎉 Level Up!')
        .setDescription(`<@${userDoc.userId}> ${isMajorMilestone ? milestone.description : `reached **Level ${newLevel}**!`}`)
        .addFields(
          { name: '📊 Previous Level', value: String(previousLevel), inline: true },
          { name: '🆙 New Level', value: String(newLevel), inline: true },
          { name: '⭐ Total XP', value: String(userDoc.xp), inline: true },
          { name: '🎯 Achievement Type', value: isMajorMilestone ? `**Major Milestone** (Level ${newLevel})` : 'Regular Level-Up', inline: false }
        )
        .setFooter({ text: isMajorMilestone ? 'Incredible achievement! Keep crushing it! 🔥' : 'Keep going to unlock more rewards!' })
        .setTimestamp();

      try {
        await announceChannel.send({ embeds: [embed] });
      } catch (error) {
        logger.warn('Failed to send level-up announcement', {
          guildId: member?.guild?.id,
          userId: userDoc.userId,
          newLevel,
          error: error.message
        });
      }
    }

    return {
      changed: true,
      previousLevel,
      newLevel
    };
  }
}

module.exports = new LevelService();
