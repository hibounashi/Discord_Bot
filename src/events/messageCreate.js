const xpService = require('../services/xpService');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    try {
      await xpService.processMessage(message);
    } catch (error) {
      logger.error('XP message processing failed', {
        guildId: message.guildId,
        userId: message.author?.id,
        error: error.message
      });
    }
  }
};
