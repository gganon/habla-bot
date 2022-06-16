const { charLimit } = require('../../config');
const { Translator, GoogleApiError } = require('../../translator');
const logger = require('../../util/logger');
const {
  sendError,
  sendTranslation,
  TRANSLATION_HEADER_REGEXP,
} = require('../../util/message');
const {
  REPLY_TRANSLATE_COMMAND_REGEXP,
  TRANSLATE_COMMAND_REGEXP,
} = require('./constants');

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
  const regexp = isReply(message)
    ? REPLY_TRANSLATE_COMMAND_REGEXP
    : TRANSLATE_COMMAND_REGEXP;

  const match = message.content.match(regexp);
  const lang1 = match[3];
  const lang2 = match[4];
  let text = match[5];
  let from, to;

  if (!lang2) {
    to = lang1;
  } else {
    from = lang1;
    to = lang2.trim();
  }

  if (isReply(message)) {
    const referencedMessage = await message.fetchReference();;
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

const handler = async message => {
  const { text, from, to } = await parseMessage(message);
  let translationResult;

  if (text.length > charLimit) {
    return message.channel.send(
      `That message is too long! Please limit your text to ${charLimit} characters.`
    );
  }

  try {
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

    sendError(message.channel, errorTitle, errorBody);
    return;
  }

  translationResult.translation = fixTranslation(translationResult.translation);

  sendTranslation(
    message,
    translationResult.from,
    text,
    translationResult.to,
    translationResult.translation
  );
};

module.exports = {
  name: 'translate',
  matches,
  handler,
};
