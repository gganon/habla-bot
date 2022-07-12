const { charLimit } = require('../../config');
const ISO6391 = require('iso-639-1');
const { Translator, GoogleApiError } = require('../../translator');
const logger = require('../../util/logger');
const { MessageEmbed, CommandInteraction } = require('discord.js');
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

  if (message instanceof CommandInteraction) {
    text = message.options.getString('text');
    from = message.options.getString('from', false);
    to = message.options.getString('to', false);
  } else {
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

const handler = async message => {
  const isSlash = message instanceof CommandInteraction;
  const { text, from, to } = await parseMessage(message);
  let translationResult;

  if (text.length > charLimit) {
    const reply = `That message is too long! Please limit your text to ${charLimit} characters.`;
    return isSlash ? message.reply(reply) : message.channel.send(reply);
  }

  try {
    if (isSlash) {
      await message.deferReply();
    }
    translationResult = await translator.translate(text, { from, to });
  } catch (e) {
    logger.error('Error in translation');
    logger.error(e);

    let errorTitle, errorBody;

    if (e instanceof GoogleApiError) {
      errorTitle = `Google Translation Error: ${e.message}`;
      errorBody = '```json\n' + JSON.stringify(e.details, null, 2) + '\n```';
    } else {
      errorTitle = e.message;
    }

    return isSlash
      ? message.editReply(createErrorMessage(errorTitle, errorBody))
      : sendError(message.channel, errorTitle, errorBody);
  }

  translationResult.translation = fixTranslation(translationResult.translation);

  if (isSlash) {
    return message.editReply(
      createTranslationMessage(
        translationResult.from,
        translationResult.to,
        translationResult.translation
      )
    );
  }
  return sendTranslation(
    message,
    translationResult.from,
    text,
    translationResult.to,
    translationResult.translation
  );
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
  autocomplete: {
    to: autocompleteLanguageOptions,
    from: autocompleteLanguageOptions,
  },
  builder: SLASH_COMMAND_BUILDER,
};
