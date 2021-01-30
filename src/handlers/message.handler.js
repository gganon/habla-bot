const config = require('../config');
const logger = require('../util/logger');
const translate = require('../commands/translate');
const help = require('../commands/help');
const { checkIfGuildIsAuthorized } = require('../util/guild');

const COMMANDS = [help, translate];

const isBotCommand = message =>
  !!message.content.match(
    new RegExp(`^(${config.prefix}|${config.shortPrefix})(\\s+.*)?$`)
  );

const isMentioned = message => message.mentions.has(message.client.user);

const messageHandler = async message => {
  checkIfGuildIsAuthorized(message.guild).catch(logger.error);

  if ((!isBotCommand(message) && !isMentioned(message)) || message.author.bot) {
    return;
  }

  logger.info(
    `Received command from "${message.author.tag}" in server "${message.guild.name}"`
  );

  const command = COMMANDS.find(command => command.matches(message));

  if (command) {
    logger.info(`Identified command: "${command.name}"`);
    await command.handler(message);
  } else {
    logger.info('Unknown command. Sending default message');
    message.reply('Try `!habla help` or `!h help`');
  }
};

module.exports = messageHandler;