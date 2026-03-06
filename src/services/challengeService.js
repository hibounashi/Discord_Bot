const Challenge = require('../models/Challenge');
const xpService = require('./xpService');

class ChallengeService {
  // Admin challenge creation with deadline + reward configuration.
  async createChallenge(payload) {
    const {
      guildId,
      createdBy,
      title,
      description,
      deadlineHours,
      xpReward
    } = payload;

    if (!Number.isInteger(deadlineHours) || deadlineHours < 1) {
      throw new Error('deadlineHours must be at least 1 hour');
    }

    const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);

    return Challenge.create({
      guildId,
      createdBy,
      title,
      description,
      deadline,
      xpReward,
      status: 'open'
    });
  }

  async getChallengeById(guildId, challengeId) {
    const challenge = await Challenge.findOne({ guildId, _id: challengeId });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    return challenge;
  }

  ensureChallengeOpen(challenge) {
    if (challenge.status !== 'open') {
      throw new Error('Challenge is already closed');
    }
  }

  ensureChallengeNotExpired(challenge) {
    if (new Date() > challenge.deadline) {
      throw new Error('Challenge deadline has passed');
    }
  }

  async submitChallenge(payload) {
    // Users can submit (or resubmit) while challenge is open and before deadline.
    const {
      guildId,
      challengeId,
      userId,
      content
    } = payload;

    const challenge = await this.getChallengeById(guildId, challengeId);
    this.ensureChallengeOpen(challenge);
    this.ensureChallengeNotExpired(challenge);

    const existing = challenge.submissions.find((item) => item.userId === userId);
    if (existing) {
      existing.content = content;
      existing.status = 'pending';
      existing.note = null;
      existing.submittedAt = new Date();
      existing.reviewedAt = null;
      existing.reviewedBy = null;
    } else {
      challenge.submissions.push({
        userId,
        content,
        status: 'pending'
      });
    }

    await challenge.save();
    return challenge;
  }

  async reviewSubmission(payload) {
    // Approval path automatically awards XP once per submission.
    const {
      guild,
      channel,
      guildId,
      challengeId,
      targetUserId,
      action,
      note,
      reviewedBy
    } = payload;

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('Action must be approve or reject');
    }

    const challenge = await this.getChallengeById(guildId, challengeId);
    this.ensureChallengeOpen(challenge);

    const submission = challenge.submissions.find((item) => item.userId === targetUserId);
    if (!submission) {
      throw new Error('Submission not found for this user');
    }

    submission.status = action === 'approve' ? 'approved' : 'rejected';
    submission.note = note || null;
    submission.reviewedAt = new Date();
    submission.reviewedBy = reviewedBy;

    let xpResult = null;

    if (action === 'approve' && !submission.xpAwarded) {
      const member = await guild.members.fetch(targetUserId).catch(() => null);

      xpResult = await xpService.applyXpChange({
        guildId,
        userId: targetUserId,
        amount: challenge.xpReward,
        type: 'challenge_reward',
        reason: `Challenge approved: ${challenge.title}`,
        actorId: reviewedBy,
        member,
        announceChannel: channel,
        announceLevelUp: true,
        touchActivity: true,
        applyStreakMultiplier: true,
        countTowardsWeekly: true,
        metadata: {
          challengeId: String(challenge._id),
          challengeTitle: challenge.title
        }
      });

      submission.xpAwarded = true;
    }

    await challenge.save();

    return {
      challenge,
      submission,
      xpResult
    };
  }

  async closeChallenge(payload) {
    // Finalization closes further submissions and reviews.
    const {
      guildId,
      challengeId,
      closedBy
    } = payload;

    const challenge = await this.getChallengeById(guildId, challengeId);
    this.ensureChallengeOpen(challenge);

    challenge.status = 'closed';
    challenge.closedAt = new Date();
    challenge.closedBy = closedBy;

    await challenge.save();

    return challenge;
  }
}

module.exports = new ChallengeService();
