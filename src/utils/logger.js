function timestamp() {
  return new Date().toISOString();
}

function format(level, message, meta) {
  const metaBlock = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp()}] [${level}] ${message}${metaBlock}`;
}

const logger = {
  info(message, meta) {
    console.log(format('INFO', message, meta));
  },
  warn(message, meta) {
    console.warn(format('WARN', message, meta));
  },
  error(message, meta) {
    console.error(format('ERROR', message, meta));
  }
};

module.exports = logger;
