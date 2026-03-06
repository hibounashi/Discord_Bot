const mongoose = require('mongoose');
const logger = require('./logger');
const { config } = require('../config');

async function connectMongo() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongodb.uri, {
    autoIndex: true
  });

  logger.info('MongoDB connected', { host: mongoose.connection.host, name: mongoose.connection.name });
}

module.exports = {
  connectMongo
};
