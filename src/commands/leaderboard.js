const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { config } = require('../config');
const leaderboardService = require('../services/leaderboardService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the global XP leaderboard ranked by experience points')
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('Page number (default: 1)')
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const page = interaction.options.getInteger('page') || 1;
    const result = await leaderboardService.getXpLeaderboard(
      interaction.guild.id,
      page,
      config.xp.leaderboardPageSize
    );

    if (result.rows.length === 0) {
      await interaction.editReply({ content: 'No leaderboard data available yet.' });
      return;
    }

    const lines = result.rows.map((entry, index) => {
      const rank = (result.page - 1) * result.pageSize + index + 1;
      return `**#${rank}** <@${entry.userId}> — **${entry.xp} XP** (Lvl ${entry.level})`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🏆 XP Leaderboard')
      .setDescription(lines.join('\n') || 'No XP data yet')
      .setFooter({ text: `Page ${result.page}/${result.totalPages} • ${result.total} total users • Earn XP by chatting!` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
