const { charLimit } = require('../../config');
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

const translator = new Translator();

// it errors when in test env
// not sure why but _getSupportedLanguages()
// seems to be overriden by jest or smt
// (it returns undefined)
if (process.env.NODE_ENV !== 'test') {
  translator
    ._getSupportedLanguages()
    .then(result => console.log(`Fetched ${result.length} supported languages`))
    .catch(console.error);
}

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
    const reply = `That message is too long! Please limit your text to ${charLimit} characters.`;
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
      e.title = 'Error';
      e.body = '```\n' + e.message + '\n```';
    }
    throw e;
  }

  translationResult.translation = fixTranslation(translationResult.translation);

  return translationResult;
};

const interactionHandler = async interaction => {
  try {
    const text = interaction.options.getString('text');
    const from = interaction.options.getString('from');
    const to = interaction.options.getString('to');

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
    if (e instanceof RangeError) {
      return interaction.editReply(e.message);
    }
    return interaction.editReply({
      embeds: [createErrorMessage(e.title, e.body)],
    });
  }
};

const handler = async message => {
  try {
    const { text, from, to } = await parseMessage(message);

    const translationResult = await translateText(text, from, to);

    const reply = createTranslationMessage(
      translationResult.from,
      translationResult.to,
      translationResult.translation
    );
    return message.reply(reply);
  } catch (e) {
    if (e instanceof RangeError) {
      return message.reply(e.message);
    }
    return message.reply({ embeds: [createErrorMessage(e.title, e.body)] });
  }
};

const autocompleteLanguageOptions = query => {
  const list = translator._getCachedSupportedLanguages();

  const _mapper = language => {
    return {
      name: `${language.native || 'Supported but unknown name'} (${
        language.name || language.code
      })`,
      value: language.code,
    };
  };

  if (!query) {
    return list.map(_mapper).slice(0, MAX_AUTOCOMPLETE_RESPOND_ENTRY);
  }
  const lowercaseQuery = query.toLowerCase();

  return list
    .filter(
      language =>
        language.code.toLowerCase().includes(lowercaseQuery) ||
        language.native.toLowerCase().includes(lowercaseQuery) ||
        language.name.toLowerCase().includes(lowercaseQuery)
    )
    .map(_mapper)
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
