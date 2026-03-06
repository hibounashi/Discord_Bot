function getUtcDateParts(date = new Date()) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate()
  };
}

function toUtcDateOnly(date = new Date()) {
  const { year, month, day } = getUtcDateParts(date);
  return new Date(Date.UTC(year, month, day));
}

function toIsoDateKey(date = new Date()) {
  return toUtcDateOnly(date).toISOString().slice(0, 10);
}

function getYesterdayKey(date = new Date()) {
  const utcDate = toUtcDateOnly(date);
  utcDate.setUTCDate(utcDate.getUTCDate() - 1);
  return toIsoDateKey(utcDate);
}

function getIsoWeekKey(date = new Date()) {
  const utcDate = toUtcDateOnly(date);

  const dayNumber = (utcDate.getUTCDay() + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);

  const weekNumber = 1 + Math.round((utcDate - firstThursday) / 604800000);
  const year = utcDate.getUTCFullYear();

  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

module.exports = {
  toIsoDateKey,
  getYesterdayKey,
  getIsoWeekKey
};
