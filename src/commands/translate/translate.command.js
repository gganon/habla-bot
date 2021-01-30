const { Translator, GoogleApiError } = require('../../translator');
const {
  sendError,
  sendTranslation,
  fetchReferencedMessage,
} = require('../../message');
const {
  REPLY_TRANSLATE_COMMAND_REGEXP,
  TRANSLATE_COMMAND_REGEXP,
} = require('./constants');

const translator = new Translator();

const isReply = message => !!message.reference;

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
  const from = match[3];
  const to = match[4];
  let text = match[5];

  if (isReply(message)) {
    const referencedMessage = await fetchReferencedMessage(message);
    text = referencedMessage.content;
  }

  return {
    text,
    from: from === '?' ? undefined : from,
    to,
  };
};

const handler = async message => {
  const { text, from, to } = await parseMessage(message);
  let translationResult;

  try {
    translationResult = await translator.translate(text, { from, to });
  } catch (e) {
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

  sendTranslation(
    message,
    translationResult.from,
    text,
    translationResult.to,
    translationResult.translation
  );
};

module.exports = {
  matches,
  handler,
};
