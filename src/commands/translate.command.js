const config = require('../config');
const { Translator, GoogleApiError } = require('../translator');
const {
  sendError,
  sendTranslation,
  fetchReferencedMessage,
} = require('../message');

const translator = new Translator();

const COMMAND_PATTERN = `(${config.prefix}|${config.shortPrefix})(( \\w+)( \\w+)?)?`;

const TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^${COMMAND_PATTERN}[\\s\\n](.+)$`,
  's'
);
const REPLY_TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^${COMMAND_PATTERN}([\\s\\n].*$|$)`,
  's'
);

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

  let [_match, _prefix, _langs, lang1, lang2, text] = message.content.match(
    regexp
  );
  let from, to;

  if (lang2 === undefined) {
    to = lang1?.trim();
  } else {
    from = lang1?.trim();
    to = lang2?.trim();
  }

  if (isReply(message)) {
    const referencedMessage = await fetchReferencedMessage(message);
    text = referencedMessage.content;
  }

  return { text, from, to };
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
    message.channel,
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
