const { getJavaScriptFiles } = require('./fileLoader');
const logger = require('./logger');

function loadCommands(client, commandsDir) {
  const files = getJavaScriptFiles(commandsDir);

  for (const file of files) {
    const command = require(file);

    if (!command || !command.data || typeof command.execute !== 'function') {
      logger.warn('Invalid command module skipped', { file });
      continue;
    }

    client.commands.set(command.data.name, command);
  }

  logger.info('Commands loaded', { count: client.commands.size });
}

module.exports = {
  loadCommands
};
