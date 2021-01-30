const config = require('../config');
const translate = require('../commands/translate');

const COMMANDS = [translate];

const isBotCommand = message =>
  !!message.content.match(
    new RegExp(`^(${config.prefix}|${config.shortPrefix})(\\s+.*)?$`)
  );

const isMentioned = message => message.mentions.has(message.client.user);

const messageHandler = async message => {
  if ((!isBotCommand(message) && !isMentioned(message)) || message.author.bot) {
    return;
  }

  const command = COMMANDS.find(command => command.matches(message));

  if (command) {
    await command.handler(message);
  }
};

module.exports = messageHandler;
