const { config } = require('../config');
const logger = require('../utils/logger');

class PermissionService {
  async isAdmin(member) {
    if (!member) {
      return false;
    }

    // Check if user has ManageGuild permission
    if (member.permissions.has('ManageGuild')) {
      return true;
    }

    // Check for "Admin" role (case-insensitive)
    const hasAdminRole = member.roles.cache.some((role) =>
      role.name.toLowerCase() === 'admin' ||
      role.name.toLowerCase() === 'moderator' ||
      role.name.toLowerCase() === 'staff'
    );

    return hasAdminRole;
  }

  async enforceAdmin(interaction) {
    const isAdmin = await this.isAdmin(interaction.member);

    if (!isAdmin) {
      await interaction.reply({
        content: '❌ **Admin Only**\n\nYou need the `Admin`, `Moderator`, or `Staff` role to use this command.\n\n💡 Ask a server admin to grant you the appropriate role.',
        flags: require('discord.js').MessageFlags.Ephemeral
      });
      return false;
    }

    return true;
  }
}

module.exports = new PermissionService();
