const { PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require('discord.js');
const xpService = require('../services/xpService');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('award')
    .setDescription('🌟 Award XP to a user for contributions or achievements (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to reward')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('XP to award (1-500 recommended)')
        .setMinValue(1)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Why are you awarding XP? (e.g., "Great event contribution")')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    const user = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const reason = interaction.options.getString('reason', true);

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const result = await xpService.applyXpChange({
      guildId: interaction.guild.id,
      userId: user.id,
      amount,
      type: 'admin_award',
      reason,
      actorId: interaction.user.id,
      member,
      announceChannel: interaction.channel,
      announceLevelUp: true,
      touchActivity: false,
      applyStreakMultiplier: false,
      countTowardsWeekly: true,
      metadata: {
        command: 'award'
      }
    });

    await interaction.reply({
      content: `\u2705 Awarded **${result.appliedDelta} XP** to <@${user.id}>\n**New total:** ${result.newXp} XP (Level ${result.level})\n**Reason:** ${reason}`,
      flags: MessageFlags.Ephemeral
    });
  }
};
