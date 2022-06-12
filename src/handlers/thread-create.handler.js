const logger = require('../util/logger');

const handler = async (thread, newlyCreated) => {
  logger.warn(`New thread created: ${thread.name} (New: ${newlyCreated})`);

  await thread.join();
  logger.warn(`Joined Thread ${thread.name}`);
};

module.exports = handler;
