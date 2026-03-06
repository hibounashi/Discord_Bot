const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { config } = require('./config');
const { getJavaScriptFiles } = require('./utils/fileLoader');
const logger = require('./utils/logger');

async function deployCommands() {
  if (!config.bot.token || !config.bot.clientId) {
    throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required to deploy commands');
  }

  const commandFiles = getJavaScriptFiles(path.join(__dirname, 'commands'));
  const commandPayload = [];

  for (const file of commandFiles) {
    const command = require(file);
    if (command?.data) {
      commandPayload.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(config.bot.token);

  if (config.bot.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.bot.clientId, config.bot.guildId),
      { body: commandPayload }
    );

    logger.info('Guild slash commands deployed', {
      guildId: config.bot.guildId,
      commandCount: commandPayload.length
    });

    return;
  }

  await rest.put(
    Routes.applicationCommands(config.bot.clientId),
    { body: commandPayload }
  );

  logger.info('Global slash commands deployed', { commandCount: commandPayload.length });
}

deployCommands().catch((error) => {
  logger.error('Slash command deployment failed', { error: error.message });
  process.exit(1);
});
