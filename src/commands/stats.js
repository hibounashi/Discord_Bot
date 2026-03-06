const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const User = require('../models/User');
const leaderboardService = require('../services/leaderboardService');
const levelService = require('../services/levelService');
const streakService = require('../services/streakService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📊 View your complete stats and achievements'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const user = await User.findOne({
      guildId: interaction.guild.id,
      userId: interaction.user.id
    });

    if (!user) {
      await interaction.editReply({
        content: '📭 No stats yet! Start chatting to earn XP and build your profile.'
      });
      return;
    }

    const rankInfo = await leaderboardService.getUserRank(interaction.guild.id, interaction.user.id);
    const rank = rankInfo ? rankInfo.rank : '?';
    
    const currentLevelXp = levelService.xpRequiredForLevel(user.level);
    const nextLevelXp = levelService.xpRequiredForLevel(user.level + 1);
    const progress = Math.max(0, user.xp - currentLevelXp);
    const needed = Math.max(0, nextLevelXp - currentLevelXp);
    const percentage = Math.round((progress / needed) * 100);

    const multiplier = streakService.getMultiplier(user.dailyStreak);
    const hasBonus = multiplier > 1;

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('📊 Your Complete Stats')
      .setDescription('Here\'s everything about your progress and achievements!')
      .addFields(
        {
          name: '🏆 Rankings',
          value: `**Server Rank:** #${rank}\n**Level:** ${user.level}\n**Total XP:** ${user.xp}`,
          inline: true
        },
        {
          name: '📈 Activity',
          value: `**Messages Sent:** ${user.messageCount}\n**Daily Streak:** ${user.dailyStreak} day(s)\n**Streak Bonus:** ${hasBonus ? '✅ Active!' : '❌ Not yet'}`,
          inline: true
        },
        {
          name: '⚡ Current Multiplier',
          value: hasBonus 
            ? `**${multiplier.toFixed(1)}x XP** 🔥\n_You're earning bonus XP!_`
            : `**${multiplier.toFixed(1)}x** \n_Keep a 7-day streak for bonus!_`,
          inline: false
        },
        {
          name: '🎯 Progress to Next Level',
          value: `${progress}/${needed} XP (${percentage}%)\n${'▓'.repeat(Math.floor(percentage / 5))}${'░'.repeat(20 - Math.floor(percentage / 5))}`,
          inline: false
        }
      )
      .setFooter({ text: `Keep chatting and staying active to climb the ranks! 💪` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
