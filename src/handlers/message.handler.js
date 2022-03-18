const config = require('../config');
const logger = require('../util/logger');
const translate = require('../commands/translate');
const help = require('../commands/help');
const { checkIfGuildIsAuthorized } = require('../util/guild');

const COMMANDS = [help, translate];

const isBotCommand = message =>
  !!message.content.match(
    new RegExp(`^(${config.prefix}|${config.shortPrefix})(\\s|$)`)
  );

const isMentioned = message =>
  message.content.match(`<@!${message.client.user.id}>`);

const messageHandler = async message => {
  if (message.author.bot) {
    return;
  }

  const authorized = await checkIfGuildIsAuthorized(message.guild);

  if (!authorized || (!isBotCommand(message) && !isMentioned(message))) {
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
    message.reply(
      `Try \`${config.prefix} help\` or \`${config.shortPrefix} help\``
    );
  }
};

module.exports = messageHandler;
