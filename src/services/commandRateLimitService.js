const { config } = require('../config');

class CommandRateLimitService {
  constructor() {
    this.commandUsageMap = new Map();
  }

  check(userId, commandName, cooldownMs = config.commandRateLimitMs) {
    const now = Date.now();
    const key = `${userId}:${commandName}`;
    const lastUsedAt = this.commandUsageMap.get(key) || 0;
    const elapsed = now - lastUsedAt;

    if (elapsed < cooldownMs) {
      return {
        limited: true,
        retryAfterMs: cooldownMs - elapsed
      };
    }

    this.commandUsageMap.set(key, now);
    return {
      limited: false,
      retryAfterMs: 0
    };
  }
}

module.exports = new CommandRateLimitService();
