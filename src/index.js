const path = require('node:path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js');

const { config, validateRuntimeConfig } = require('./config');
const { connectMongo } = require('./utils/mongo');
const { loadCommands } = require('./utils/loadCommands');
const { loadEvents } = require('./utils/loadEvents');
const logger = require('./utils/logger');

async function bootstrap() {
  validateRuntimeConfig();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
  });

  client.commands = new Collection();

  await connectMongo();

  loadCommands(client, path.join(__dirname, 'commands'));
  loadEvents(client, path.join(__dirname, 'events'));

  await client.login(config.bot.token);
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
});

bootstrap().catch((error) => {
  logger.error('Bot bootstrap failed', { error: error.message });
  process.exit(1);
});
