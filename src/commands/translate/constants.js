const config = require('../../config');

const PREFIX = `${config.prefix}|${config.shortPrefix}`;

const TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^(${PREFIX})( (\\?|\\w+) (\\w+))[\\s\\n](.+)$`,
  's'
);
const REPLY_TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^(${PREFIX})( (\\?|\\w+)( \\w+)?)?$`
);

module.exports = {
  TRANSLATE_COMMAND_REGEXP,
  REPLY_TRANSLATE_COMMAND_REGEXP,
};
