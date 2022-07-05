'use strict';

const { createErrorMessage, createTranslationMessage } = require('./util');

const sendError = (channel, title, details) => {
  const message = createErrorMessage(title, details);
  return channel.send(message);
};

const sendTranslation = (originalMessage, from, text, to, translation) => {
  const message = createTranslationMessage(from, to, translation);
  return originalMessage.reply(message);
};

module.exports = {
  sendError,
  sendTranslation,
};
