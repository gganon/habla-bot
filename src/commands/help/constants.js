const config = require('../../config');

const COMMAND_PATTERN = `(${config.prefix}|${config.shortPrefix}) help`;

const TRANSLATE_HELP = [
  { name: 'Prefix', value: '`!h` or `!habla`' },

  { name: 'Get help', value: '`!h help` or `!habla help`' },

  {
    name: 'Translate text',
    value: '`!h french dutch Bonjour!` _(from french to dutch)_',
  },

  {
    name: "Use '?' if you don't know the original language",
    value:
      '`!h ? dutch Bonjour!` _(Habla will try to detect the original language)_',
  },

  {
    name: 'You can even use 2 letter language codes',
    value: '`!h fr nl Bonjour!`',
  },

  {
    name: "Translate someone else's message",
    value: `Reply to the other person's message with:
\`!h\` _(Habla will detect the language and translate it to English)_

Or specify the language you want to translate it to:
\`!h french dutch\` _(from french to dutch)_

Or use '?' if you don't know the original language:
\`!h ? dutch\``,
  },
];

module.exports = {
  COMMAND_PATTERN,
  TRANSLATE_HELP,
};
