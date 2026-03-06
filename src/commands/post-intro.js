const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');
const { aiFieldRoles } = require('../config/roles');
const permissionService = require('../services/permissionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('post-intro')
    .setDescription('⚡ Admin: Post server introduction and AI field selector')
    .setDefaultMemberPermissions(0)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to post introduction (leave blank for current)')
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    if (!(await permissionService.enforceAdmin(interaction))) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const guild = interaction.guild;

    // Get channel references by name
    const generalChannel = guild.channels.cache.find(c => c.name === 'general');
    const aiDiscussionChannel = guild.channels.cache.find(c => c.name === 'ai-discussion');
    const researchChannel = guild.channels.cache.find(c => c.name === 'research');
    const challengesChannel = guild.channels.cache.find(c => c.name === 'challenges');
    const offTopicChannel = guild.channels.cache.find(c => c.name === 'off-topic');

    // Create intro message
    const introMessage = `**🧠 Welcome to SOAI Neuro World**

Hello @NEURON 

**About SOAI Neuro Land**
Welcome to **SOAI Neuro Land**, the official community of **School of AI Bejaia ESTIN** — a place where curious minds connect, learn, build, and explore Artificial Intelligence together.

This server is built to help you **learn AI**, **collaborate on projects**, **attend events**, and **meet other passionate students**.

**:o_: Who is Neuro?**
In this world, **Neuro is the brain of the community** — the spirit of innovation and intelligence that connects every member.

**And you are a Neuron.** 🧬

Just like neurons in a brain, each member contributes **knowledge, ideas, and energy** to make this network stronger.

**Together we create a living AI ecosystem.**

**🎯 Your Journey**
**Earn XP** by chatting and contributing → **Level Up** to unlock roles & features → **Complete Challenges** for extra rewards → **Pick Your AI Specialty** to show expertise!

**📚 Channel Guide**
${generalChannel ? `🌍 ${generalChannel} - Community announcements\n` : ''}${aiDiscussionChannel ? `🤖 ${aiDiscussionChannel} - AI & tech discussions\n` : ''}${researchChannel ? `🧠 ${researchChannel} - Research & insights\n` : ''}${challengesChannel ? `🏆 ${challengesChannel} - Competitions & submissions\n` : ''}${offTopicChannel ? `💬 ${offTopicChannel} - Fun conversations\n` : ''}
✨ You are the future of AI. Build it together!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎓 Choose Your AI Specialty**
React to select your field of expertise! (You can pick multiple)
Your specialty role helps personalize content and connects you with experts.

🧠 **Deep Learning** - Neural networks, transformers, LLMs
📊 **Data Science** - Analytics, statistics, visualization
🤖 **Machine Learning** - Algorithms, training, models
⚙️ **AI Engineering** - Deployment, systems, infrastructure
🗣 **NLP** - Language models, text processing
🔍 **Computer Vision** - Image recognition, object detection
🎮 **Reinforcement Learning** - Agents, rewards, optimization
🧪 **Research AI** - Cutting-edge research & theory

⬇️ **React below to get your roles!**`;

    try {
      const sentMessage = await targetChannel.send(introMessage);

      // Add reactions for AI field selection
      for (const field of aiFieldRoles) {
        await sentMessage.react(field.emoji).catch(() => null);
      }

      await interaction.editReply({
        content: `✅ Introduction posted to ${targetChannel}!\n📌 Message ID: \`${sentMessage.id}\`\n🎓 AI field reactions are active!`
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Failed to post introduction: ${error.message}`
      });
    }
  }
};
