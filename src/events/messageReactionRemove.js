const reactionRoleService = require('../services/reactionRoleService');
const { aiFieldRoles } = require('../config/roles');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    try {
      // Fetch full message data if partial
      if (reaction.partial) {
        await reaction.fetch();
      }

      // Check if this is a field role selection message by checking embeds
      const isFieldRoleMessage = reaction.message.embeds?.some(embed => 
        embed.title?.includes('Choose Your AI Specialty')
      );
      
      if (isFieldRoleMessage) {
        await handleFieldRoleReaction(reaction, user, false);
      } else {
        // Handle regular reaction roles
        await reactionRoleService.handleReaction(reaction, user, false);
      }
    } catch (error) {
      logger.error('Reaction role remove failed', {
        userId: user?.id,
        messageId: reaction.message?.id,
        error: error.message
      });
    }
  }
};

async function handleFieldRoleReaction(reaction, user, isAdd) {
  if (user.bot) return;

  const guild = reaction.message.guild;
  if (!guild) {
    logger.warn('Guild not found for field role reaction');
    return;
  }

  const member = await guild.members.fetch(user.id).catch((error) => {
    logger.error('Failed to fetch member for field role', { userId: user.id, error: error.message });
    return null;
  });

  if (!member) {
    logger.warn('Member not found for field role reaction', { userId: user.id, guildId: guild.id });
    return;
  }

  const emojiString = reaction.emoji.toString();

  // Find matching AI field role
  const fieldRole = aiFieldRoles.find(role => role.emoji === emojiString);
  if (!fieldRole) {
    logger.debug('Emoji not matched to field role', { emoji: emojiString, emojiName: reaction.emoji.name });
    return;
  }

  const role = guild.roles.cache.find(r => r.name === fieldRole.name);
  if (!role) {
    logger.error('AI field role not found in guild', {
      guildId: guild.id,
      fieldName: fieldRole.name,
      emoji: emojiString,
      availableRoles: Array.from(guild.roles.cache.values()).slice(0, 10).map(r => r.name)
    });
    return;
  }

  try {
    if (isAdd) {
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role, `AI field selection: ${fieldRole.name}`);
        logger.info('AI field role assigned', {
          guildId: guild.id,
          userId: user.id,
          fieldName: fieldRole.name,
          userName: user.username
        });
      }
    } else {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role, `AI field deselection: ${fieldRole.name}`);
        logger.info('AI field role removed', {
          guildId: guild.id,
          userId: user.id,
          fieldName: fieldRole.name,
          userName: user.username
        });
      }
    }
  } catch (error) {
    logger.error('Failed to assign/remove AI field role', {
      guildId: guild.id,
      userId: user.id,
      fieldName: fieldRole.name,
      isAdd,
      error: error.message,
      errorCode: error.code
    });
  }
}
