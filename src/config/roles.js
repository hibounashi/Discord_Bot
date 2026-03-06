const levelRoles = [
  { minLevel: 1, name: '⚪ Neuron Seed' },
  { minLevel: 5, name: '🟢 Neuron Explorer' },
  { minLevel: 10, name: '🔵 Neuron Builder' },
  { minLevel: 15, name: '🟣 Neuron Researcher' },
  { minLevel: 20, name: '🟡 Neuron Architect' },
  { minLevel: 30, name: '🔥 Neuron Master' }
];

const aiFieldRoles = [
  { emoji: '🧠', name: '🧠 Deep Learning' },
  { emoji: '📊', name: '📊 Data Science' },
  { emoji: '🤖', name: '🤖 Machine Learning' },
  { emoji: '⚙️', name: '⚙️ AI Engineering' },
  { emoji: '🗣', name: '🗣 NLP' },
  { emoji: '🔍', name: '🔍 Computer Vision' },
  { emoji: '🎮', name: '🎮 Reinforcement Learning' },
  { emoji: '🧪', name: '🧪 Research AI' }
];

const weeklyRoles = {
  neuronOfTheWeek: 'Neuron of the Week',
  communitySpark: '🌟 Community Spark'
};

const eventParticipantRole = 'Event Participant';

module.exports = {
  levelRoles,
  aiFieldRoles,
  weeklyRoles,
  eventParticipantRole
};
