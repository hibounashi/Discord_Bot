const User = require('../models/User');
const { config } = require('../config');

class MilestoneService {
  // Milestone thresholds for achievements
  milestones = {
    messages: [10, 50, 100, 500, 1000, 2500, 5000, 10000],
    xp: [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
    levels: [5, 10, 15, 20, 25, 30, 40, 50]
  };

  checkMessageMilestone(oldCount, newCount) {
    for (const milestone of this.milestones.messages) {
      if (oldCount < milestone && newCount >= milestone) {
        return {
          reached: true,
          type: 'messages',
          value: milestone,
          emoji: '📬',
          title: 'Message Milestone!',
          description: `You've sent **${milestone} messages**! Keep the conversation going!`
        };
      }
    }
    return { reached: false };
  }

  checkXpMilestone(oldXp, newXp) {
    for (const milestone of this.milestones.xp) {
      if (oldXp < milestone && newXp >= milestone) {
        return {
          reached: true,
          type: 'xp',
          value: milestone,
          emoji: '⭐',
          title: 'XP Milestone!',
          description: `You've earned **${milestone} total XP**! You're crushing it!`
        };
      }
    }
    return { reached: false };
  }

  checkLevelMilestone(level) {
    if (this.milestones.levels.includes(level)) {
      return {
        reached: true,
        type: 'level',
        value: level,
        emoji: '🏆',
        title: 'Major Level Milestone!',
        description: `Level **${level}** achieved! This is a huge accomplishment!`
      };
    }
    return { reached: false };
  }

  shouldAnnounceLevel(level) {
    // Only announce every 5 levels, or milestone levels
    return level % 5 === 0 || this.milestones.levels.includes(level);
  }
}

module.exports = new MilestoneService();
