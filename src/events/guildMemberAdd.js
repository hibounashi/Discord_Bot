const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    if (member.user.bot) {
      return;
    }

    try {
      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x6CD7E6)
        .setTitle(`🎉 Welcome to ${member.guild.name}!`)
        .setDescription(`Hey ${member.user.username}! We're excited to have you here.`)
        .addFields(
          {
            name: '💬 Earn XP',
            value: 'Chat in any channel to earn **15 XP** per message! Auto-level up and unlock exclusive roles.',
            inline: false
          },
          {
            name: '🔥 Build Streaks',
            value: 'Stay active daily to build your streak and earn **1.2x XP multiplier** after 7 days!',
            inline: false
          },
          {
            name: '🏆 Join Challenges',
            value: 'Participate in community challenges to earn bonus XP and recognition.',
            inline: false
          },
          {
            name: '🎤 Attend Events',
            value: 'Join voice channels and stay 30+ minutes to earn attendance XP and special roles.',
            inline: false
          },
          {
            name: '❓ Need Help?',
            value: 'Type `/help` anytime to see all commands and how everything works!',
            inline: false
          }
        )
        .setThumbnail(member.guild.iconURL())
        .setFooter({ text: 'Start chatting now to earn your first XP!' })
        .setTimestamp();

      await member.send({ embeds: [welcomeEmbed] }).catch(() => {
        logger.warn('Could not DM welcome message to new member', {
          guildId: member.guild.id,
          userId: member.id
        });
      });
    } catch (error) {
      logger.error('Welcome message failed', {
        guildId: member.guild.id,
        userId: member.id,
        error: error.message
      });
    }
  }
};
