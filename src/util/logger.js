const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const config = require('../config');

const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp }) => {
      return `[${timestamp} ${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
