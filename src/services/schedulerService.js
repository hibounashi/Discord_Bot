const cron = require('node-cron');
const { config } = require('../config');
const weeklyService = require('./weeklyService');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.started = false;
    this.weeklyRoleJob = null;
  }

  start(client) {
    if (this.started) {
      return;
    }

    this.weeklyRoleJob = cron.schedule(
      config.scheduler.weeklyCron,
      async () => {
        try {
          await weeklyService.processWeeklyRoleRotation(client);
        } catch (error) {
          logger.error('Weekly scheduler job failed', { error: error.message });
        }
      },
      {
        timezone: config.scheduler.timezone
      }
    );

    this.started = true;

    logger.info('Scheduler started', {
      weeklyRoleCron: config.scheduler.weeklyCron,
      timezone: config.scheduler.timezone
    });
  }
}

module.exports = new SchedulerService();
