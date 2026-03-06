const { PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require('discord.js');
const reactionRoleService = require('../services/reactionRoleService');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('post-reaction-roles')
    .setDescription('🖜️ Post the AI field roles panel (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    const panel = await reactionRoleService.postReactionRolePanel(interaction.channel);

    await interaction.reply({
      content: `✅ Reaction role panel created!\n\n📍 **Panel message:** [Jump to message](https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${panel.id})\n\n💡 **Tip:** Pin this message so members can easily find it!`,
      flags: MessageFlags.Ephemeral
    });
  }
};
