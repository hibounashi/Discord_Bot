const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tip')
    .setDescription('💡 Get a random tip to understand the XP system better'),

  async execute(interaction) {
    // Array of tips
    const tips = [
      {
        title: '💰 Earning XP',
        description: 'Send a message with **10+ characters** to earn **15 XP**.\nYou can earn XP **once every 30 seconds** to prevent spam.\nKeep chatting and leveling up!'
      },
      {
        title: '🔥 Streak Bonus',
        description: 'Chat **every day** to build a streak.\n\n**7+ days streak** = **1.2x XP multiplier**\nIf you have a 7-day streak:\n- Regular message = 15 XP\n- Streak bonus = 18 XP\n\nStay active every day!'
      },
      {
        title: '⬆️ Level Formula',
        description: 'XP needed = **100 × (Level ^ 1.5)**\n\nExamples:\n- Level 1 = 100 XP\n- Level 5 = 1,118 XP\n- Level 10 = 3,162 XP\n- Level 20 = 17,889 XP\n\nEach level gets harder!'
      },
      {
        title: '🏆 Weekly Challenges',
        description: 'Special challenges appear every week!\n\nComplete them to earn:\n- Easy = 10-25 XP\n- Medium = 25-50 XP\n- Hard = 50-100 XP\n\nCheck challenges for extra rewards!'
      },
      {
        title: '📊 Level Milestones',
        description: 'Unlock features at each level:\n\n**Level 5** = Create challenges\n**Level 10** = Pick AI specialty\n**Level 15** = Research access\n**Level 20** = Moderate challenges\n**Level 30** = Master status\n\nKeep leveling up!'
      },
      {
        title: '⚡ Pro Strategy',
        description: 'To level up **20% faster:**\n\n1️⃣ Chat **daily** (maintain streak)\n2️⃣ Keep **7+ day streak** (1.2x bonus)\n3️⃣ **Complete weekly challenges** (extra XP)\n4️⃣ Track progress with `/rank`\n\nConsistency = Faster leveling!'
      },
      {
        title: '📈 Quick Math',
        description: 'Average XP per day:\n\n**Without streak:**\n- 10 messages = 150 XP/day\n\n**With 7+ day streak:**\n- 10 messages = 180 XP/day\n- **+30 XP/day = +900 XP/month**\n\nStreaks make a big difference!'
      },
      {
        title: '🎯 Track Your Progress',
        description: 'Use these commands:\n\n`/rank` = Your rank & XP progress\n`/stats` = Full stats dashboard\n`/streak` = Your current streak\n`/leaderboard` = Top players\n\nAlways know where you stand!'
      },
      {
        title: '💡 Consistency Wins',
        description: 'The key to leveling fast is **staying active**.\n\n1 message per day = 15 XP/day\n30 days = 450 XP\nWith streak bonus = 540 XP!\n\nSmall actions = Big progress!'
      },
      {
        title: '🚀 Getting Started',
        description: '**Your first day:**\n1️⃣ Send messages (earn 15 XP each)\n2️⃣ Check `/rank` (see your progress)\n3️⃣ Build your streak (chat tomorrow too)\n4️⃣ Complete challenges (extra XP)\n\nYou can do it!'
      }
    ];

    // Get random tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    const embed = new EmbedBuilder()
      .setColor(0x6CD7E6)
      .setTitle(randomTip.title)
      .setDescription(randomTip.description)
      .setFooter({ text: '💡 Use /tip again for another tip!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
