const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const config = require('../config');

const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: combine(
    format.errors({ stack: true }),
    timestamp(),
    printf(({ level, message, timestamp, stack }) => {
      return `[${timestamp} ${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
