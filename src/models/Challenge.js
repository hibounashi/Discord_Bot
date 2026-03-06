const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    note: {
      type: String,
      default: null
    },
    xpAwarded: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    createdBy: {
      type: String,
      required: true
    },
    deadline: {
      type: Date,
      required: true,
      index: true
    },
    xpReward: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true
    },
    submissions: {
      type: [submissionSchema],
      default: []
    },
    closedAt: {
      type: Date,
      default: null
    },
    closedBy: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

challengeSchema.index({ guildId: 1, status: 1, deadline: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
