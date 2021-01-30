const config = require('../../config');

const COMMAND_PATTERN = `(${config.prefix}|${config.shortPrefix})(( \\w+)( \\w+)?)?`;

const TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^${COMMAND_PATTERN}[\\s\\n](.+)$`,
  's'
);
const REPLY_TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^${COMMAND_PATTERN}([\\s\\n].*$|$)`,
  's'
);

module.exports = {
  COMMAND_PATTERN,
  TRANSLATE_COMMAND_REGEXP,
  REPLY_TRANSLATE_COMMAND_REGEXP,
};
