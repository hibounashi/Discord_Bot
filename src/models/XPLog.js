const mongoose = require('mongoose');

const xpLogSchema = new mongoose.Schema(
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
    actorId: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'message',
        'admin_award',
        'admin_remove',
        'challenge_reward',
        'attendance_reward',
        'system'
      ]
    },
    reason: {
      type: String,
      default: 'No reason provided'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

xpLogSchema.index({ guildId: 1, createdAt: -1 });

module.exports = mongoose.model('XPLog', xpLogSchema);
