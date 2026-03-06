const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require('discord.js');
const challengeService = require('../services/challengeService');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-challenge')
    .setDescription('🏁 Create a new community challenge with XP reward (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('title')
        .setDescription('Challenge name (e.g., "Build an AI Model")')
        .setMaxLength(120)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('What do users need to do? Be specific!')
        .setMaxLength(2000)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('deadline-hours')
        .setDescription('Hours until deadline (1-720)')
        .setMinValue(1)
        .setMaxValue(720)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('xp-reward')
        .setDescription('XP reward for approval (suggested: 50-200)')
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const deadlineHours = interaction.options.getInteger('deadline-hours', true);
    const xpReward = interaction.options.getInteger('xp-reward', true);

    const challenge = await challengeService.createChallenge({
      guildId: interaction.guild.id,
      createdBy: interaction.user.id,
      title,
      description,
      deadlineHours,
      xpReward
    });

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🏁 Challenge Created!')
      .setDescription(`**${challenge.title}**\n${challenge.description}`)
      .addFields(
        { name: '🆔 Challenge ID', value: `\`${challenge._id}\``, inline: false },
        { name: '⏰ Deadline', value: `<t:${Math.floor(challenge.deadline.getTime() / 1000)}:F>`, inline: true },
        { name: '🏆 XP Reward', value: `${challenge.xpReward} XP`, inline: true }
      )
      .setFooter({ text: 'Share the Challenge ID for users to submit!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
