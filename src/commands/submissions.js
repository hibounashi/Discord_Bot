const { EmbedBuilder, SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Challenge = require('../models/Challenge');
const permissionService = require('../services/permissionService');
const challengeService = require('../services/challengeService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submissions')
    .setDescription('⚡ Admin: Review challenge submissions with easy approve/reject')
    .setDefaultMemberPermissions(0)
    .addStringOption((option) =>
      option
        .setName('challenge-id')
        .setDescription('Challenge ID to review submissions for')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const challengeId = interaction.options.getString('challenge-id', true);

    try {
      const challenge = await challengeService.getChallengeById(interaction.guild.id, challengeId);

      const pendingSubmissions = challenge.submissions.filter((s) => s.status === 'pending');
      const approvedSubmissions = challenge.submissions.filter((s) => s.status === 'approved');
      const rejectedSubmissions = challenge.submissions.filter((s) => s.status === 'rejected');

      if (challenge.submissions.length === 0) {
        await interaction.editReply({
          content: `📭 No submissions yet for **${challenge.title}**.\n\nShare the Challenge ID with members to start collecting submissions!`
        });
        return;
      }

      // Build embeds for each submission
      const embeds = [];

      // Summary
      const summaryEmbed = new EmbedBuilder()
        .setColor(0x6CD7E6)
        .setTitle(`📋 ${challenge.title}`)
        .setDescription(challenge.description)
        .addFields(
          { name: '⏳ Pending Review', value: String(pendingSubmissions.length), inline: true },
          { name: '✅ Approved', value: String(approvedSubmissions.length), inline: true },
          { name: '❌ Rejected', value: String(rejectedSubmissions.length), inline: true },
          { name: '🏆 XP Reward', value: String(challenge.xpReward), inline: true },
          { name: 'Status', value: challenge.status === 'open' ? '🟢 Open' : '⚪ Closed', inline: true }
        );
      embeds.push(summaryEmbed);

      // Pending submissions with action buttons
      if (pendingSubmissions.length > 0) {
        const pendingText = pendingSubmissions
          .map(
            (s, i) =>
              `**#${i + 1}** <@${s.userId}>\n${s.content.substring(0, 100)}${s.content.length > 100 ? '...' : ''}`
          )
          .join('\n\n');

        const pendingEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`⏳ Pending Review (${pendingSubmissions.length})`)
          .setDescription(pendingText || 'No pending submissions.')
          .setFooter({ text: 'React to the summary above to approve/reject submissions or use /close-challenge' });

        embeds.push(pendingEmbed);
      }

      // Approved submissions
      if (approvedSubmissions.length > 0) {
        const approvedText = approvedSubmissions
          .map((s) => `✅ <@${s.userId}> — ${s.note || 'Approved'}`)
          .join('\n');

        const approvedEmbed = new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle(`✅ Approved (${approvedSubmissions.length})`)
          .setDescription(approvedText);

        embeds.push(approvedEmbed);
      }

      // Rejected submissions
      if (rejectedSubmissions.length > 0) {
        const rejectedText = rejectedSubmissions
          .map((s) => `❌ <@${s.userId}> — ${s.note || 'Rejected'}`)
          .join('\n');

        const rejectedEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle(`❌ Rejected (${rejectedSubmissions.length})`)
          .setDescription(rejectedText);

        embeds.push(rejectedEmbed);
      }

      const helpText =
        '**For detailed review:**\n' + '`/close-challenge approve <id> <user> [note]`\n' + '`/close-challenge reject <id> <user> [note]`\n' + '`/close-challenge finalize <id>` - Close for new submissions';

      await interaction.editReply({
        embeds,
        content: helpText
      });
    } catch (error) {
      let msg = '❌ Failed to load submissions. ';

      if (error.message.includes('not found')) {
        msg += 'Challenge not found. Check the Challenge ID.';
      } else {
        msg += error.message;
      }

      await interaction.editReply({
        content: msg
      });
    }
  }
};
