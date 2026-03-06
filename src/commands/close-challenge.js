const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require('discord.js');
const challengeService = require('../services/challengeService');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close-challenge')
    .setDescription('🛠️ Review and approve challenge submissions (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('approve')
        .setDescription('Approve a submission and award XP')
        .addStringOption((option) =>
          option
            .setName('challenge-id')
            .setDescription('Challenge ID')
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to approve')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('note')
            .setDescription('Approval message (optional)')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reject')
        .setDescription('Reject a submission with feedback')
        .addStringOption((option) =>
          option
            .setName('challenge-id')
            .setDescription('Challenge ID')
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to reject')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('note')
            .setDescription('Rejection reason for user')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('finalize')
        .setDescription('Close challenge for new submissions')
        .addStringOption((option) =>
          option
            .setName('challenge-id')
            .setDescription('Challenge ID')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    const action = interaction.options.getSubcommand();
    const challengeId = interaction.options.getString('challenge-id', true);

    try {
      if (action === 'finalize') {
        const challenge = await challengeService.closeChallenge({
          guildId: interaction.guild.id,
          challengeId,
          closedBy: interaction.user.id
        });

        await interaction.reply({
          content: `✅ Challenge **${challenge.title}** has been closed.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const targetUser = interaction.options.getUser('user', true);
      const note = interaction.options.getString('note') || null;

      const result = await challengeService.reviewSubmission({
        guild: interaction.guild,
        channel: interaction.channel,
        guildId: interaction.guild.id,
        challengeId,
        targetUserId: targetUser.id,
        action,
        note,
        reviewedBy: interaction.user.id
      });

      const embed = new EmbedBuilder()
        .setColor(0x6CD7E6)
        .setTitle(action === 'approve' ? '✅ Submission Approved!' : '❌ Submission Rejected')
        .setDescription(`<@${targetUser.id}>'s work on **${result.challenge.title}**`)
        .addFields(
          { name: 'Challenge', value: result.challenge.title, inline: false },
          { name: action === 'approve' ? '🎆 XP Awarded' : '📄 Feedback', value: action === 'approve' ? `**+${result.xpResult?.appliedDelta || 0} XP**` : (note || 'Please resubmit'), inline: false }
        )
        .setFooter({ text: action === 'approve' ? 'Keep up the great work!' : 'Try again and submit when ready!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
      let friendlyMessage = '❌ Action failed. ';
      
      if (error.message.includes('not found') && error.message.includes('Challenge')) {
        friendlyMessage += 'Challenge not found. Double-check the Challenge ID.\n💡 **Tip:** Copy the exact ID from when you created it!';
      } else if (error.message.includes('Submission not found')) {
        const user = interaction.options.getUser('user');
        friendlyMessage += `<@${user?.id}> has not submitted to this challenge yet.\n⏳ **Note:** They need to use \`/submit-challenge\` first!`;
      } else if (error.message.includes('closed')) {
        friendlyMessage += 'This challenge is already closed.\n🔒 Cannot modify closed challenges.';
      } else {
        friendlyMessage += error.message;
      }

      await interaction.reply({
        content: friendlyMessage,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
