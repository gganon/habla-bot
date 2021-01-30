const logger = require('../util/logger');
const { checkIfGuildIsAuthorized } = require('../util/guild');

const handler = async guild => {
  logger.warn(`Added to server "${guild.name}" (${guild.id})`);
  await checkIfGuildIsAuthorized(guild);
};

module.exports = handler;
