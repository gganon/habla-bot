const Discord = require('discord.js');
const config = require('./config.js');
const logger = require('./logger');

const client = new Discord.Client();
client.login(config.botToken);

client.once('ready', () => {
  logger.info('Online');
});
