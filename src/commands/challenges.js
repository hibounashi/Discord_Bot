const { EmbedBuilder, SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Challenge = require('../models/Challenge');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('challenges')
    .setDescription('⚡ Admin: View and manage all server challenges')
    .setDefaultMemberPermissions(0),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const [openChallenges, closedChallenges] = await Promise.all([
      Challenge.find({ guildId: interaction.guild.id, status: 'open' }).sort({ deadline: 1 }).lean(),
      Challenge.find({ guildId: interaction.guild.id, status: 'closed' }).sort({ closedAt: -1 }).limit(5).lean()
    ]);

    if (openChallenges.length === 0 && closedChallenges.length === 0) {
      await interaction.editReply({
        content: '📭 No challenges found. Create one with `/create-challenge`!'
      });
      return;
    }

    const openEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🟢 Active Challenges')
      .setDescription(
        openChallenges.length > 0
          ? openChallenges.map((c, i) => {
              const timeRemaining = Math.ceil((c.deadline - Date.now()) / 3600000);
              const submissionCount = c.submissions?.length || 0;
              const approvedCount = c.submissions?.filter(s => s.status === 'approved').length || 0;
              return `**${i + 1}. ${c.title}**\n⏰ ${timeRemaining}h left | 📤 ${submissionCount} submissions (${approvedCount} approved) | 🏆 ${c.xpReward} XP\n\`${c._id}\``;
            }).join('\n\n')
          : 'No active challenges.'
      )
      .setFooter({ text: 'Use /submissions <challenge-id> to review submissions' });

    const closedEmbed = new EmbedBuilder()
      .setColor(0x909090)
      .setTitle('⚪ Recently Closed')
      .setDescription(
        closedChallenges.length > 0
          ? closedChallenges.map((c) => {
              const approvedCount = c.submissions?.filter(s => s.status === 'approved').length || 0;
              return `**${c.title}** — ${approvedCount} approved | 🏆 ${c.xpReward} XP`;
            }).join('\n')
          : 'No closed challenges.'
      );

    const statsEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('📊 Challenge Stats')
      .addFields(
        { name: '🟢 Active', value: String(openChallenges.length), inline: true },
        { name: '⚪ Closed', value: String(closedChallenges.length), inline: true },
        { name: '📤 Total Submissions', value: String(openChallenges.reduce((a, c) => a + (c.submissions?.length || 0), 0)), inline: true }
      );

    const helpText = '💡 **Quick Commands:**\n' +
      '`/create-challenge` — Start new challenge\n' +
      '`/submissions <id>` — Review submissions\n' +
      '`/close-challenge finalize <id>` — Close for submissions';

    await interaction.editReply({
      embeds: [statsEmbed, openEmbed, closedEmbed],
      content: helpText
    });
  }
};
