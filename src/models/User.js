const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 0,
      min: 0
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastXpAt: {
      type: Date,
      default: null
    },
    lastMessageHash: {
      type: String,
      default: null
    },
    lastActivityDate: {
      type: String,
      default: null
    },
    lastActivityAt: {
      type: Date,
      default: null
    },
    dailyStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    voiceSessionStartedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ guildId: 1, userId: 1 }, { unique: true });
userSchema.index({ guildId: 1, xp: -1 });

module.exports = mongoose.model('User', userSchema);
