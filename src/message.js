const Discord = require('discord.js');

const sendError = (channel, title, details) => {
  const message = new Discord.MessageEmbed()
    .setTitle(title)
    .addField('Details', details);
  channel.send(message);
};

const sendTranslation = (originalMessage, from, text, to, translation) => {
  const message = `_(Translated from ${from} to ${to})_:\n\n${translation}`;
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
};
