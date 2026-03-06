const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quickstart')
    .setDescription('🚀 Quick setup guide for new members'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🚀 Quick Start Guide')
      .setDescription('Welcome! Here\'s how to get started and earn rewards:')
      .addFields(
        {
          name: '1️⃣ Start Chatting',
          value: '• Send messages in any channel\n• Earn **15 XP per message** (30-sec cooldown)\n• Messages must be 10+ characters\n• No spamming or duplicates!',
          inline: false
        },
        {
          name: '2️⃣ Check Your Progress',
          value: '• Use `/rank` to see your level and XP\n• Use `/leaderboard` to compete with others\n• Use `/streak` to see your daily activity bonus',
          inline: false
        },
        {
          name: '3️⃣ Get Field Roles',
          value: '• React to the AI field roles message\n• Choose your interests (ML, NLP, CV, etc.)\n• Multiple roles allowed!',
          inline: false
        },
        {
          name: '4️⃣ Join Activities',
          value: '• Stay active daily to build your **streak** (7 days = 1.2x XP!)\n• Join voice channels for 30+ min to earn attendance XP\n• Complete challenges for bonus rewards',
          inline: false
        },
        {
          name: '5️⃣ Level Up',
          value: '• Level up automatically as you earn XP\n• Unlock exclusive roles at levels 1, 5, 10, 15, 20, 30\n• Major milestones get special celebrations!',
          inline: false
        }
      )
      .setFooter({ text: 'Type /help for a full list of commands!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
