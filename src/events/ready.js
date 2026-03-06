const schedulerService = require('../services/schedulerService');
const logger = require('../utils/logger');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    logger.info('Bot is online', {
      tag: client.user.tag,
      id: client.user.id,
      guilds: client.guilds.cache.size
    });

    schedulerService.start(client);
  }
};
