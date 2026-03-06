const { EmbedBuilder } = require('discord.js');
const { config } = require('../config');
const logger = require('../utils/logger');

class RoleLogService {
  async logRoleChange(guild, payload) {
    if (!guild || !config.channels.roleLogChannelId) {
      return;
    }

    const {
      userId,
      roleName,
      action,
      reason = 'No reason provided',
      source = 'system'
    } = payload;

    try {
      const channel = guild.channels.cache.get(config.channels.roleLogChannelId)
        || await guild.channels.fetch(config.channels.roleLogChannelId).catch(() => null);

      if (!channel || !channel.isTextBased()) {
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x6CD7E6)
        .setTitle('Role Change')
        .setDescription(`<@${userId}> ${action} **${roleName}**`)
        .addFields(
          { name: 'Reason', value: reason, inline: false },
          { name: 'Source', value: source, inline: true }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn('Failed to log role change', {
        guildId: guild.id,
        userId,
        roleName,
        action,
        error: error.message
      });
    }
  }
}

module.exports = new RoleLogService();
