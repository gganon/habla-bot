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

const fetchReferencedMessage = async message => {
  const client = message.client;
  const { channelID, messageID } = message.reference;
  const channel = await client.channels.fetch(channelID);
  const referencedMessage = await channel.messages.fetch(messageID);
  return referencedMessage;
};

module.exports = {
  sendError,
  sendTranslation,
  fetchReferencedMessage,
  TRANSLATION_HEADER,
  TRANSLATION_HEADER_REGEXP,
};
