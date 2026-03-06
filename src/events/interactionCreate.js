const { MessageFlags } = require('discord.js');
const commandRateLimitService = require('../services/commandRateLimitService');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    const { limited, retryAfterMs } = commandRateLimitService.check(
      interaction.user.id,
      interaction.commandName,
      command.cooldownMs
    );

    if (limited) {
      const seconds = (retryAfterMs / 1000).toFixed(1);
      await interaction.reply({
        content: `Rate limit active. Please wait ${seconds}s before using this command again.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      logger.error('Command execution failed', {
        commandName: interaction.commandName,
        userId: interaction.user.id,
        guildId: interaction.guildId,
        error: error.message
      });

      const payload = {
        content: 'An error occurred while executing this command.',
        flags: MessageFlags.Ephemeral
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  }
};
