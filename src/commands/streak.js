const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const User = require('../models/User');
const streakService = require('../services/streakService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('streak')
    .setDescription('View daily activity streak and XP multiplier bonus')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to check (leave blank for yourself)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user') || interaction.user;

    const userDoc = await User.findOne({
      guildId: interaction.guild.id,
      userId: targetUser.id
    }).lean();

    const streak = userDoc?.dailyStreak || 0;
    const multiplier = streakService.getMultiplier(streak);

    const streakLevel = streak >= 30 ? '🔥🔥🔥' : streak >= 14 ? '🔥🔥' : streak >= 7 ? '🔥' : '❄️';

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle(`${streakLevel} ${targetUser.username}'s Activity Streak`)
      .setDescription(streak > 0 ? `Keep it going! Stay active to maintain your streak.` : 'No active streak. Start chatting to build one!')
      .addFields(
        { name: '📅 Current Streak', value: `${streak} day(s)`, inline: true },
        { name: '⚡ XP Bonus', value: `${multiplier.toFixed(1)}x${streak > 7 ? ' 🎁' : ''}`, inline: true }
      )
      .setFooter({ text: streak > 7 ? '🎉 You\'re getting bonus XP from your streak!' : 'Reach 7 days for bonus XP' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
