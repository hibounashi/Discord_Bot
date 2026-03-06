const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const challengeService = require('../services/challengeService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit-challenge')
    .setDescription('📄 Submit your work to a challenge for review')
    .addStringOption((option) =>
      option
        .setName('challenge-id')
        .setDescription('Challenge ID (ask admin for this)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('submission')
        .setDescription('Your submission details, link, or proof')
        .setMaxLength(2000)
        .setRequired(true)
    ),

  async execute(interaction) {
    const challengeId = interaction.options.getString('challenge-id', true);
    const submission = interaction.options.getString('submission', true);

    try {
      const challenge = await challengeService.submitChallenge({
        guildId: interaction.guild.id,
        challengeId,
        userId: interaction.user.id,
        content: submission
      });

      await interaction.reply({
        content: `✅ Submission saved for **${challenge.title}**!\nAdmins will review and approve soon. Check back for your reward!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      let friendlyMessage = '❌ Submission failed. ';
      
      if (error.message.includes('not found')) {
        friendlyMessage += 'Could not find that challenge. Check the Challenge ID and try again.\n💡 **Tip:** Ask an admin for the correct Challenge ID!';
      } else if (error.message.includes('closed')) {
        friendlyMessage += 'This challenge is closed for new submissions.\n🔍 Use `/weekly-top` to see other active challenges!';
      } else if (error.message.includes('deadline')) {
        friendlyMessage += 'This challenge deadline has passed.\n⏰ Watch for new challenges coming soon!';
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
