const Discord = require('discord.js');

const TRANSLATION_HEADER = '_(Translated from {{from}} to {{to}})_:\n\n';
const TRANSLATION_HEADER_REGEXP = /_\(Translated from \w+ to \w+\)_:\n\n/;

const sendError = (channel, title, details) => {
  const message = new Discord.MessageEmbed()
    .setTitle(title)
    .addField('Details', details);
  channel.send(message);
};

const sendTranslation = (originalMessage, from, text, to, translation) => {
  const header = TRANSLATION_HEADER.replace('{{from}}', from).replace(
    '{{to}}',
    to
  );

  const message = header + translation;
  originalMessage.reply(message);
};

module.exports = {
  sendError,
  sendTranslation,
  TRANSLATION_HEADER,
  TRANSLATION_HEADER_REGEXP,
};
