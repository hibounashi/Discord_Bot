const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { config } = require('../config');
const leaderboardService = require('../services/leaderboardService');
const weeklyService = require('../services/weeklyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weekly-top')
    .setDescription('View this week\'s top performers by XP and activity')
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('Page number (default: 1)')
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    const page = interaction.options.getInteger('page') || 1;

    const [xpBoard, weeklyTop] = await Promise.all([
      leaderboardService.getWeeklyTop(interaction.guild.id, page, config.xp.leaderboardPageSize),
      weeklyService.getWeeklyTop(interaction.guild.id, undefined, 3)
    ]);

    if (xpBoard.rows.length === 0) {
      await interaction.reply({ content: 'No weekly stats yet.', flags: MessageFlags.Ephemeral });
      return;
    }

    const xpLines = xpBoard.rows.map((entry, index) => {
      const rank = (xpBoard.page - 1) * xpBoard.pageSize + index + 1;
      return `**#${rank}** <@${entry.userId}> — **${entry.xpGained} XP**`;
    });

    const messageLines = weeklyTop.messageTop.map((entry, index) => {
      return `**#${index + 1}** <@${entry.userId}> — **${entry.messageCount} msgs**`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle(`⭐ Weekly Top • Week ${xpBoard.weekKey}`)
      .setDescription('**Most XP This Week:**\n' + xpLines.join('\n'))
      .addFields({
        name: '💬 Most Messages',
        value: messageLines.length > 0 ? messageLines.join('\n') : 'No data yet.'
      })
      .setFooter({ text: `Winners get special roles! Earn XP to compete next week.` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
