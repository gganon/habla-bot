const config = require('./config');
const translate = require('./commands/translate.command');

const COMMANDS = [translate];

const isBotCommand = message =>
  message.content.match(
    new RegExp(`^(${config.prefix}|${config.shortPrefix})(\\s+.*)?$`)
  );

const messageHandler = async message => {
  if (!isBotCommand(message) || message.author.bot) {
    return;
  }

  const command = COMMANDS.find(command => command.matches(message));

  if (command) {
    await command.handler(message);
  }
};

module.exports = messageHandler;
