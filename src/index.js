const Discord = require('discord.js');
const config = require('./config');
const messageHandler = require('./handlers/message.handler');
const guildCreateHandler = require('./handlers/guild-create.handler');
const logger = require('./util/logger');

const client = new Discord.Client();
client.login(config.botToken);

client.once('ready', () => {
  logger.info('Online');
});

client.on('message', messageHandler);

client.on('guildCreate', guildCreateHandler);
