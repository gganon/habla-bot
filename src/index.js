const Discord = require('discord.js');
const config = require('./config');
const messageHandler = require('./handlers/message.handler');
const guildCreateHandler = require('./handlers/guild-create.handler');
const logger = require('./util/logger');

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
client.login(config.botToken);

client.once('ready', () => {
  logger.info('Online');
});

const withError = (event, handler) => async (...args) => {
  try {
    await handler(...args);
  } catch (e) {
    logger.error(`Error while handling event ${event}`);
    logger.error(e);
  }
};

client.on('messageCreate', withError('messageCreate', messageHandler));

client.on('guildCreate', withError('guildCreate', guildCreateHandler));
