const { getJavaScriptFiles } = require('./fileLoader');
const logger = require('./logger');

function loadEvents(client, eventsDir) {
  const files = getJavaScriptFiles(eventsDir);

  for (const file of files) {
    const event = require(file);

    if (!event || !event.name || typeof event.execute !== 'function') {
      logger.warn('Invalid event module skipped', { file });
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
      continue;
    }

    client.on(event.name, (...args) => event.execute(...args, client));
  }

  logger.info('Events loaded', { count: files.length });
}

module.exports = {
  loadEvents
};
