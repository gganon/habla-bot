const config = require('./config');

const isBotCommand = message =>
  message.content.match(
    new RegExp(`^(${config.prefix}|${config.shortPrefix})(\\s+.*)?$`)
  );

const messageHandler = message => {
  if (!isBotCommand(message) || message.author.bot) {
    return;
  }

  message.channel.send('I hear ya');
};

module.exports = messageHandler;
