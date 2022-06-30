const Discord = require('discord.js');
const { COMMAND_PATTERN, TRANSLATE_HELP } = require('./constants');

const matches = message => !!message.content.match(COMMAND_PATTERN);

const handler = message => {
  const helpMessage = new Discord.MessageEmbed()
    .setTitle('Habla Translator Bot - Help')
    .setDescription(
      'A bot that translates text and messages. Powered by Google Translate!'
    )
    .addFields(TRANSLATE_HELP);

  return message.reply({ embeds: [helpMessage] });
};

module.exports = {
  name: 'help',
  matches,
  handler,
};
