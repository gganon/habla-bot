const logger = require('../util/logger');
const registerApplicationCommands = require('../util/registerApplicationCommands');

const guildId = process.argv[2];

registerApplicationCommands(guildId).catch(logger.error);
