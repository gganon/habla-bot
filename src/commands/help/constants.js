const config = require('../../config');

const COMMAND_PATTERN = `(${config.prefix}|${config.shortPrefix}) help`;

const TRANSLATE_HELP = [
  {
    name: 'Prefix',
    value: `\`${config.shortPrefix}\` or \`${config.prefix}\``,
  },

  {
    name: 'Get help',
    value: `\`${config.shortPrefix} help\` or \`${config.prefix} help\``,
  },

  {
    name: 'Translate text',
    value: `\`${config.shortPrefix} french dutch Bonjour!\` _(from french to dutch)_`,
  },

  {
    name: "Use '?' if you don't know the original language",
    value: `\`${config.shortPrefix} ? dutch Bonjour!\` _(Habla will try to detect the original language)_`,
  },

  {
    name: 'You can even use 2 letter language codes',
    value: `\`${config.shortPrefix} fr nl Bonjour!\``,
  },

  {
    name: "Translate someone else's message",
    value: `Reply to the other person's message with:
\`${config.shortPrefix}\` _(Habla will detect the language and translate it to English)_

Or specify the language you want to translate it to:
\`${config.shortPrefix} french dutch\` _(from french to dutch)_

Or use '?' if you don't know the original language:
\`${config.shortPrefix} ? dutch\``,
  },
];

module.exports = {
  COMMAND_PATTERN,
  TRANSLATE_HELP,
};
