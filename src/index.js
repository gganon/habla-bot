const Discord = require('discord');
const config = require('./config');
const messageHandler = require('./handlers/message.handler');
const logger = require('./logger');

const client = new Discord.Client();
client.login(config.botToken);

client.once('ready', () => {
  logger.info('Online');
});

client.on('message', messageHandler);
