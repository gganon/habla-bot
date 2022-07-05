'use strict';

const { MessageEmbed } = require('discord.js');
const { TRANSLATION_HEADER } = require('./constants');

const createErrorMessage = (title, details) => {
  return new MessageEmbed().setTitle(title).addField('Details', details);
};

const createTranslationMessage = (from, to, translation) => {
  const header = TRANSLATION_HEADER.replace('{{from}}', from).replace(
    '{{to}}',
    to
  );

  return header + translation;
};

module.exports = {
  createErrorMessage,
  createTranslationMessage,
};
