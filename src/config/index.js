const dotenv = require('dotenv');

dotenv.config();

const config = {
  bot: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID || null
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  xp: {
    messageAmount: Number.parseInt(process.env.XP_PER_MESSAGE || '15', 10),
    cooldownMs: Number.parseInt(process.env.XP_COOLDOWN_MS || '30000', 10),
    minMessageLength: Number.parseInt(process.env.XP_MIN_MESSAGE_LENGTH || '10', 10),
    leaderboardPageSize: Number.parseInt(process.env.LEADERBOARD_PAGE_SIZE || '10', 10),
    attendanceReward: Number.parseInt(process.env.ATTENDANCE_XP_REWARD || '40', 10),
    weeklyTopSize: 10
  },
  streak: {
    multiplierThreshold: Number.parseInt(process.env.STREAK_MULTIPLIER_THRESHOLD || '7', 10),
    multiplier: Number.parseFloat(process.env.STREAK_MULTIPLIER || '1.2')
  },
  attendance: {
    minMinutes: Number.parseInt(process.env.ATTENDANCE_MIN_MINUTES || '30', 10)
  },
  channels: {
    roleLogChannelId: process.env.ROLE_LOG_CHANNEL_ID || null
  },
  reactionRoles: {
    messageId: process.env.REACTION_ROLE_MESSAGE_ID || null,
    fieldMessageId: process.env.FIELD_ROLE_MESSAGE_ID || null
  },
  scheduler: {
    weeklyCron: process.env.WEEKLY_ROLE_CRON || '0 0 * * 1',
    timezone: process.env.SCHEDULER_TIMEZONE || 'UTC'
  },
  commandRateLimitMs: Number.parseInt(process.env.COMMAND_RATE_LIMIT_MS || '2500', 10)
};

function validateRuntimeConfig() {
  const missing = [];

  if (!config.bot.token) {
    missing.push('DISCORD_TOKEN');
  }

  if (!config.bot.clientId) {
    missing.push('DISCORD_CLIENT_ID');
  }

  if (!config.mongodb.uri) {
    missing.push('MONGODB_URI');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  config,
  validateRuntimeConfig
};
