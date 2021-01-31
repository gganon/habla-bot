const config = require('../../config');

const PREFIX = `${config.prefix}|${config.shortPrefix}`;
const LANGUAGES = '( (\\?|\\w+) (\\w+))';

const TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^(${PREFIX})${LANGUAGES}[\\s\\n](.+)$`,
  's'
);
const REPLY_TRANSLATE_COMMAND_REGEXP = new RegExp(`^(${PREFIX})${LANGUAGES}?$`);

module.exports = {
  TRANSLATE_COMMAND_REGEXP,
  REPLY_TRANSLATE_COMMAND_REGEXP,
};
