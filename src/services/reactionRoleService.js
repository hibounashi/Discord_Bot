const { EmbedBuilder } = require('discord.js');
const { aiFieldRoles } = require('../config/roles');
const { config } = require('../config');
const roleLogService = require('./roleLogService');
const logger = require('../utils/logger');

class ReactionRoleService {
  constructor() {
    this.runtimeTrackedMessageByGuild = new Map();
  }

  setTrackedMessageId(guildId, messageId) {
    this.runtimeTrackedMessageByGuild.set(guildId, messageId);
  }

  getTrackedMessageId(guildId) {
    return this.runtimeTrackedMessageByGuild.get(guildId) || config.reactionRoles.messageId || null;
  }

  buildReactionRoleEmbed() {
    const lines = aiFieldRoles.map((item) => `${item.emoji} — **${item.name}**`);

    return new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🎯 Choose Your AI Field Roles')
      .setDescription(
        '**Select the AI fields you\'re interested in!**\n\n' +
        lines.join('\n') +
        '\n\n**How to use:**\n' +
        '✅ React with an emoji to **add** that role\n' +
        '❌ Remove your reaction to **remove** the role\n' +
        '💡 You can select **multiple fields**!'
      )
      .setFooter({ text: 'Choose all that interest you! Roles help us know your expertise.' })
      .setTimestamp();
  }

  async postReactionRolePanel(channel) {
    const embed = this.buildReactionRoleEmbed();
    const panelMessage = await channel.send({ embeds: [embed] });

    for (const item of aiFieldRoles) {
      await panelMessage.react(item.emoji);
    }

    this.setTrackedMessageId(channel.guild.id, panelMessage.id);

    return panelMessage;
  }

  getRoleByEmoji(emojiIdentifier) {
    // Handle both custom emoji names and unicode emoji characters
    return aiFieldRoles.find((item) => 
      item.emoji === emojiIdentifier || item.name.includes(emojiIdentifier)
    ) || null;
  }

  async ensureReactionFetched(reaction) {
    if (reaction.partial) {
      await reaction.fetch();
    }

    if (reaction.message.partial) {
      await reaction.message.fetch();
    }
  }

  async handleReaction(reaction, user, addRole) {
    if (user.bot) {
      return;
    }

    await this.ensureReactionFetched(reaction).catch(() => null);

    const guild = reaction.message.guild;
    if (!guild) {
      return;
    }

    const trackedMessageId = this.getTrackedMessageId(guild.id);
    if (!trackedMessageId || reaction.message.id !== trackedMessageId) {
      return;
    }

    // Handle both custom emoji names and unicode emoji characters
    const emojiIdentifier = reaction.emoji.name || reaction.emoji.toString();
    const roleMapping = this.getRoleByEmoji(emojiIdentifier);
    if (!roleMapping) {
      return;
    }

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return;
    }

    const role = guild.roles.cache.find((candidate) => candidate.name === roleMapping.name);
    if (!role) {
      logger.warn('Reaction role target not found', {
        guildId: guild.id,
        roleName: roleMapping.name
      });
      return;
    }

    if (addRole && !member.roles.cache.has(role.id)) {
      await member.roles.add(role, 'Reaction role selected').catch(() => null);

      await roleLogService.logRoleChange(guild, {
        userId: member.id,
        roleName: role.name,
        action: 'assigned',
        reason: 'Selected via reaction role panel',
        source: 'reaction_roles'
      });
    }

    if (!addRole && member.roles.cache.has(role.id)) {
      await member.roles.remove(role, 'Reaction role removed').catch(() => null);

      await roleLogService.logRoleChange(guild, {
        userId: member.id,
        roleName: role.name,
        action: 'removed',
        reason: 'Removed via reaction role panel',
        source: 'reaction_roles'
      });
    }
  }
}

module.exports = new ReactionRoleService();
