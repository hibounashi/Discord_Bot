const { eventParticipantRole } = require('../config/roles');
const { config } = require('../config');
const xpService = require('./xpService');
const roleLogService = require('./roleLogService');
const logger = require('../utils/logger');

class AttendanceService {
  // Tracks voice session lifecycle and grants rewards when minimum duration is met.
  async handleVoiceStateUpdate(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot || !member.guild) {
      return;
    }

    const joinedVoice = !oldState.channelId && newState.channelId;
    const leftVoice = oldState.channelId && !newState.channelId;
    const switchedVoice = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

    const userDoc = await xpService.getOrCreateUser(member.guild.id, member.id);
    if (!userDoc) {
      return;
    }

    if (joinedVoice) {
      userDoc.voiceSessionStartedAt = new Date();
      await userDoc.save();
      return;
    }

    if (switchedVoice) {
      if (!userDoc.voiceSessionStartedAt) {
        userDoc.voiceSessionStartedAt = new Date();
        await userDoc.save();
      }

      return;
    }

    if (!leftVoice || !userDoc.voiceSessionStartedAt) {
      return;
    }

    const sessionStart = userDoc.voiceSessionStartedAt;
    const minutesInVoice = Math.floor((Date.now() - sessionStart.getTime()) / 60000);

    userDoc.voiceSessionStartedAt = null;
    await userDoc.save();

    if (minutesInVoice < config.attendance.minMinutes) {
      return;
    }

    await xpService.applyXpChange({
      guildId: member.guild.id,
      userId: member.id,
      amount: config.xp.attendanceReward,
      type: 'attendance_reward',
      reason: `Voice attendance reward (${minutesInVoice} minutes)`,
      actorId: null,
      member,
      announceChannel: null,
      announceLevelUp: false,
      touchActivity: true,
      applyStreakMultiplier: true,
      countTowardsWeekly: true,
      metadata: {
        minutesInVoice
      }
    });

    await this.assignEventParticipantRole(member);
  }

  async assignEventParticipantRole(member) {
    // Event role is granted once and retained for server moderation policy.
    const role = member.guild.roles.cache.find((candidate) => candidate.name === eventParticipantRole);
    if (!role) {
      logger.warn('Event participant role not found in guild', {
        guildId: member.guild.id,
        roleName: eventParticipantRole
      });
      return;
    }

    if (member.roles.cache.has(role.id)) {
      return;
    }

    await member.roles.add(role, 'Event attendance requirement met').catch(() => null);

    await roleLogService.logRoleChange(member.guild, {
      userId: member.id,
      roleName: role.name,
      action: 'assigned',
      reason: 'Qualified for event attendance role',
      source: 'attendance_tracker'
    });
  }
}

module.exports = new AttendanceService();
