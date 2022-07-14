const { charLimit } = require('../../config');
const ISO6391 = require('iso-639-1');
const { Translator, GoogleApiError } = require('../../translator');
const logger = require('../../util/logger');
const { MessageEmbed } = require('discord.js');
const {
  REPLY_TRANSLATE_COMMAND_REGEXP,
  TRANSLATE_COMMAND_REGEXP,
  SLASH_COMMAND_BUILDER,
  TRANSLATION_HEADER,
  TRANSLATION_HEADER_REGEXP,
  MAX_AUTOCOMPLETE_RESPOND_ENTRY,
} = require('./constants');

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

const sendError = (channel, title, details) => {
  const message = createErrorMessage(title, details);
  return channel.send(message);
};

const sendTranslation = (originalMessage, from, text, to, translation) => {
  const message = createTranslationMessage(from, to, translation);
  return originalMessage.reply(message);
};

const translator = new Translator();

const isReply = message => !!message.reference;

const isFromHabla = message =>
  isReply(message) && message.author.id === message.client.user.id;

const removeTranslationHeader = content =>
  content.replace(TRANSLATION_HEADER_REGEXP, '');

const matches = message => {
  const regexp = isReply(message)
    ? REPLY_TRANSLATE_COMMAND_REGEXP
    : TRANSLATE_COMMAND_REGEXP;

  return regexp.test(message.content);
};

const parseMessage = async message => {
  let text, from, to;
  const regexp = isReply(message)
    ? REPLY_TRANSLATE_COMMAND_REGEXP
    : TRANSLATE_COMMAND_REGEXP;

  const match = message.content.match(regexp);
  const lang1 = match[3];
  const lang2 = match[4];
  text = match[5];

  if (!lang2) {
    to = lang1;
  } else {
    from = lang1;
    to = lang2.trim();
  }

  if (isReply(message)) {
    const referencedMessage = await message.fetchReference();
    text = referencedMessage.content;

    if (isFromHabla(referencedMessage)) {
      text = removeTranslationHeader(text);
    }
  }

  return {
    text: text.normalize('NFKC'),
    from: from === '?' ? undefined : from,
    to,
  };
};

// fix any unwanted changes resulting from Google Translate
const fixTranslation = translation => {
  return translation.replace(/<@! (\d+)>/g, '<@!$1>'); // fix unwanted space introduced by Google Translate in user mentions
};

const translateText = async (text, from, to) => {
  let translationResult;

  if (text.length > charLimit) {
    const reply = `That text is too long! Please limit your text to ${charLimit} characters.`;
    throw new RangeError(reply);
  }

  try {
    translationResult = await translator.translate(text, { from, to });
  } catch (e) {
    logger.error('Error in translation');
    logger.error(e);

    if (e instanceof GoogleApiError) {
      e.title = `Google Translation Error: ${e.message}`;
      e.body = '```json\n' + JSON.stringify(e.details, null, 2) + '\n```';
    } else {
      e.title = e.message;
    }
    throw e;
  }

  translationResult.translation = fixTranslation(translationResult.translation);

  return translationResult;
};

const interactionHandler = async interaction => {
  try {
    const text = interaction.options.getString('text');
    const from = interaction.options.getString('from', false);
    const to = interaction.options.getString('to', false);

    await interaction.deferReply();
    const translationResult = await translateText(text, from, to);

    return interaction.editReply(
      createTranslationMessage(
        translationResult.from,
        translationResult.to,
        translationResult.translation
      )
    );
  } catch (e) {
    if (e instanceof GoogleApiError) {
      return interaction.editReply(createErrorMessage(e.title, e.body));
    } else if (e instanceof RangeError) {
      return interaction.editReply(e.message);
    } else {
      throw e;
    }
  }
};

const handler = async message => {
  try {
    const { text, from, to } = await parseMessage(message);

    const translationResult = await translateText(text, from, to);

    return sendTranslation(
      message,
      translationResult.from,
      text,
      translationResult.to,
      translationResult.translation
    );
  } catch (e) {
    if (e instanceof GoogleApiError) {
      return sendError(message.channel, e.title, e.body);
    } else if (e instanceof RangeError) {
      return message.channel.send(e.message);
    } else {
      throw e;
    }
  }
};

const autocompleteLanguageOptions = query => {
  if (!query) {
    return ISO6391.getAllNames()
      .map(language => {
        return { name: language, value: language };
      })
      .slice(0, MAX_AUTOCOMPLETE_RESPOND_ENTRY);
  }
  const list = ISO6391.getAllNames();
  const lowercaseQuery = query.toLowerCase();

  return list
    .filter(language => language.toLowerCase().includes(lowercaseQuery))
    .map(language => {
      return { name: language, value: language };
    })
    .slice(0, MAX_AUTOCOMPLETE_RESPOND_ENTRY);
};

module.exports = {
  name: 'translate',
  matches,
  handler,
  interactionHandler,
  autocomplete: {
    to: autocompleteLanguageOptions,
    from: autocompleteLanguageOptions,
  },
  builder: SLASH_COMMAND_BUILDER,
};
