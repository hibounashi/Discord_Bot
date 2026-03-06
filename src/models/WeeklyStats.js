const mongoose = require('mongoose');

const weeklyStatsSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    weekKey: {
      type: String,
      required: true,
      index: true
    },
    xpGained: {
      type: Number,
      default: 0
    },
    messageCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

weeklyStatsSchema.index({ guildId: 1, weekKey: 1, xpGained: -1 });
weeklyStatsSchema.index({ guildId: 1, weekKey: 1, messageCount: -1 });
weeklyStatsSchema.index({ guildId: 1, userId: 1, weekKey: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyStats', weeklyStatsSchema);
