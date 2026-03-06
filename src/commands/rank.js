const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const leaderboardService = require('../services/leaderboardService');
const levelService = require('../services/levelService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or someone\'s XP rank, level, and progress to next level')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to check (leave blank for yourself)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const rankInfo = await leaderboardService.getUserRank(interaction.guild.id, targetUser.id);

    if (!rankInfo) {
      await interaction.editReply({
        content: `${targetUser} has no XP data yet.`
      });
      return;
    }

    const { rank, user } = rankInfo;

    const currentLevelXp = levelService.xpRequiredForLevel(user.level);
    const nextLevelXp = levelService.xpRequiredForLevel(user.level + 1);
    const progress = Math.max(0, user.xp - currentLevelXp);
    const needed = Math.max(0, nextLevelXp - currentLevelXp);

    const progressBar = Math.round((progress / needed) * 20);
    const bar = '█'.repeat(progressBar) + '░'.repeat(20 - progressBar);

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle(`${targetUser.username}'s Rank`)
      .setDescription(`Ranked **#${rank}** out of all users`)
      .addFields(
        { name: '🎖️ Level', value: String(user.level), inline: true },
        { name: '⭐ Total XP', value: String(user.xp), inline: true },
        { name: '🔥 Streak', value: `${user.dailyStreak} day(s)`, inline: true },
        { name: '💬 Messages', value: String(user.messageCount), inline: true },
        { name: '📈 Progress to Next Level', value: `\`${bar}\` ${progress}/${needed} XP`, inline: false }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: 'Keep playing to level up and gain rewards!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
