const { PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require('discord.js');
const xpService = require('../services/xpService');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-xp')
    .setDescription('⚠️ Remove XP from a user for rule violations (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to penalize')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('XP to remove')
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    const user = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const result = await xpService.applyXpChange({
      guildId: interaction.guild.id,
      userId: user.id,
      amount: -amount,
      type: 'admin_remove',
      reason: 'Admin XP removal',
      actorId: interaction.user.id,
      member,
      announceChannel: null,
      announceLevelUp: false,
      touchActivity: false,
      applyStreakMultiplier: false,
      countTowardsWeekly: true,
      metadata: {
        command: 'remove-xp'
      }
    });

    await interaction.reply({
      content: `⚠️ Removed **${Math.abs(result.appliedDelta)} XP** from <@${user.id}>\n**New total:** ${result.newXp} XP`,
      flags: MessageFlags.Ephemeral
    });
  }
};
