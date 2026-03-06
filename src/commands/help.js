const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all available commands and how to use them'),

  async execute(interaction) {
    const userCommands = [
      { name: '/quickstart', desc: '🚀 Complete beginner guide - start here!' },
      { name: '/stats', desc: '📊 View your complete stats and achievements' },
      { name: '/rank [@user]', desc: 'Check your or someone\'s XP rank and level progress' },
      { name: '/leaderboard [page]', desc: 'View global XP rankings' },
      { name: '/weekly-top [page]', desc: 'See this week\'s top performers' },
      { name: '/streak [@user]', desc: 'Check your activity streak and XP multiplier' },
      { name: '/submit-challenge <id> <text>', desc: 'Submit work to an active challenge' }
    ];

    const adminCommands = [
      { name: '/award <user> <amount> <reason>', desc: 'Reward a user with XP for achievements' },
      { name: '/remove-xp <user> <amount>', desc: 'Penalize a user for rule violations' },
      { name: '/create-challenge <title> <desc> <hours> <xp>', desc: 'Create a new community challenge' },
      { name: '/close-challenge approve/reject <id> <user>', desc: 'Review and approve/reject submissions' },
      { name: '/post-reaction-roles', desc: 'Create the AI field roles reaction panel' }
    ];

    const userEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('👤 User Commands')
      .setDescription(userCommands.map((cmd) => `**${cmd.name}**\n${cmd.desc}`).join('\n\n'))
      .setFooter({ text: '💡 New? Start with /quickstart for a complete guide!' });

    const adminEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('⚙️ Admin Commands')
      .setDescription(adminCommands.map((cmd) => `**${cmd.name}**\n${cmd.desc}`).join('\n\n'))
      .setFooter({ text: 'Manage rewards, challenges, and keep the server engaged' });

    const systemEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('⚡ How It Works')
      .addFields(
        {
          name: '💬 XP & Leveling',
          value: '• Earn **15 XP** per meaningful message (30-sec cooldown)\n• Auto-level with formula: `100 × (level)^1.5`\n• Gain roles as you level up'
        },
        {
          name: '🔥 Activity Streaks',
          value: '• Build streaks by staying active\n• **7+ day streak** = **1.2x XP multiplier**'
        },
        {
          name: '🎯 Challenges',
          value: '• Admins create challenges with deadlines and XP rewards\n• Users submit work for admin review\n• Get bonus XP when approved'
        },
        {
          name: '🎤 Voice Events',
          value: '• Join voice channels and stay **30+ minutes**\n• Auto-earn attendance XP\n• Unlock special roles'
        }
      )
      .setFooter({ text: 'React to get field roles, compete in weekly rankings, earn exclusive perks!' });

    await interaction.reply({
      embeds: [userEmbed, adminEmbed, systemEmbed],
      flags: MessageFlags.Ephemeral
    });
  }
};
