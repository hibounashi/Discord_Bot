const attendanceService = require('../services/attendanceService');
const logger = require('../utils/logger');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    try {
      await attendanceService.handleVoiceStateUpdate(oldState, newState);
    } catch (error) {
      logger.error('Voice attendance tracking failed', {
        guildId: oldState.guild?.id || newState.guild?.id,
        userId: oldState.id || newState.id,
        error: error.message
      });
    }
  }
};
