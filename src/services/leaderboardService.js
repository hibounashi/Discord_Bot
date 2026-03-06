const User = require('../models/User');
const WeeklyStats = require('../models/WeeklyStats');
const { config } = require('../config');
const weeklyService = require('./weeklyService');

class LeaderboardService {
  async getUserRank(guildId, userId) {
    const user = await User.findOne({ guildId, userId });
    if (!user) {
      return null;
    }

    const rank = await User.countDocuments({ guildId, xp: { $gt: user.xp } }) + 1;
    return {
      rank,
      user
    };
  }

  async getXpLeaderboard(guildId, page = 1, pageSize = config.xp.leaderboardPageSize) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const [rows, total] = await Promise.all([
      User.find({ guildId })
        .sort({ xp: -1, level: -1, updatedAt: 1 })
        .skip((safePage - 1) * safePageSize)
        .limit(safePageSize)
        .lean(),
      User.countDocuments({ guildId })
    ]);

    return {
      rows,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize))
    };
  }

  async getWeeklyTop(guildId, page = 1, pageSize = config.xp.leaderboardPageSize) {
    const weekKey = weeklyService.getCurrentWeekKey();
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const [rows, total] = await Promise.all([
      WeeklyStats.find({ guildId, weekKey })
        .sort({ xpGained: -1, messageCount: -1 })
        .skip((safePage - 1) * safePageSize)
        .limit(safePageSize)
        .lean(),
      WeeklyStats.countDocuments({ guildId, weekKey })
    ]);

    return {
      rows,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
      weekKey
    };
  }
}

module.exports = new LeaderboardService();
