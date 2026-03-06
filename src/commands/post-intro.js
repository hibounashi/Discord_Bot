const { EmbedBuilder, SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');
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

    // Create main intro embed
    const introEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🧠 Welcome to SOAI Neuro World')
      .setDescription('Hello @⚪ Neuron Seed ')
      .addFields(
        {
          name: 'About SOAI Neuro Land',
          value: 'Welcome to **SOAI Neuro Land**, the official community of **School of AI Bejaia ESTIN** — a place where curious minds connect, learn, build, and explore Artificial Intelligence together.\n\nThis server is built to help you **learn AI**, **collaborate on projects**, **attend events**, and **meet other passionate students**.',
          inline: false
        },
        {
          name: '🧠 Who is Neuro?',
          value: 'In this world, **Neuro is the brain of the community** — the spirit of innovation and intelligence that connects every member.\n\n**And you are a Neuron.** 🧬\n\nJust like neurons in a brain, each member contributes **knowledge, ideas, and energy** to make this network stronger.\n\n**Together we create a living AI ecosystem.**',
          inline: false
        },
        {
          name: '🎯 Your Journey',
          value: '**Earn XP** by chatting and contributing → **Level Up** to unlock roles & features → **Complete Challenges** for extra rewards → **Pick Your AI Specialty** to show expertise!',
          inline: false
        },
        {
          name: '📚 Channel Guide',
          value: `${generalChannel ? `🌍 ${generalChannel} - Community announcements\n` : ''}${aiDiscussionChannel ? `🤖 ${aiDiscussionChannel} - AI & tech discussions\n` : ''}${researchChannel ? `🧠 ${researchChannel} - Research & insights\n` : ''}${challengesChannel ? `🏆 ${challengesChannel} - Competitions & submissions\n` : ''}${offTopicChannel ? `💬 ${offTopicChannel} - Fun conversations\n` : ''}\n👇 **React below to choose your AI specialty!**`,
          inline: false
        }
      )
      .setFooter({ text: '✨ You are the future of AI. Build it together!' })
      .setTimestamp();

    // Create AI field selection embed
    const fieldEmbed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle('🎓 Choose Your AI Specialty')
      .setDescription('React to select your field of expertise! (You can pick multiple)\n\nYour specialty role helps personalize content and connects you with experts.')
      .addFields(
        {
          name: '🧠 Deep Learning',
          value: 'Neural networks, transformers, LLMs',
          inline: true
        },
        {
          name: '📊 Data Science',
          value: 'Analytics, statistics, visualization',
          inline: true
        },
        {
          name: '🤖 Machine Learning',
          value: 'Algorithms, training, models',
          inline: true
        },
        {
          name: '⚙️ AI Engineering',
          value: 'Deployment, systems, infrastructure',
          inline: true
        },
        {
          name: '🗣 NLP',
          value: 'Language models, text processing',
          inline: true
        },
        {
          name: '🔍 Computer Vision',
          value: 'Image recognition, object detection',
          inline: true
        },
        {
          name: '🎮 Reinforcement Learning',
          value: 'Agents, rewards, optimization',
          inline: true
        },
        {
          name: '🧪 Research AI',
          value: 'Cutting-edge research & theory',
          inline: true
        }
      )
      .setFooter({ text: '⬇️ React below to get your roles!' });

    try {
      const sentMessage = await targetChannel.send({
        embeds: [introEmbed, fieldEmbed]
      });

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
