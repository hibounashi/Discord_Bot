const { config } = require('../config');
const { getYesterdayKey, toIsoDateKey } = require('../utils/dateUtils');

class StreakService {
  applyActivity(userDoc, now = new Date()) {
    const todayKey = toIsoDateKey(now);

    if (userDoc.lastActivityDate === todayKey) {
      userDoc.lastActivityAt = now;
      return {
        changed: false,
        streak: userDoc.dailyStreak,
        multiplier: this.getMultiplier(userDoc.dailyStreak)
      };
    }

    const yesterdayKey = getYesterdayKey(now);
    if (userDoc.lastActivityDate === yesterdayKey) {
      userDoc.dailyStreak += 1;
    } else {
      userDoc.dailyStreak = 1;
    }

    userDoc.lastActivityDate = todayKey;
    userDoc.lastActivityAt = now;

    return {
      changed: true,
      streak: userDoc.dailyStreak,
      multiplier: this.getMultiplier(userDoc.dailyStreak)
    };
  }

  getMultiplier(streak) {
    if (streak > config.streak.multiplierThreshold) {
      return config.streak.multiplier;
    }

    return 1;
  }
}

module.exports = new StreakService();
