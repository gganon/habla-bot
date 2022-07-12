const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config');

const PREFIX = `${config.prefix}|${config.shortPrefix}`;

const TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^(${PREFIX})( (\\?|\\w+) (\\w+))[\\s\\n](.+)$`,
  's'
);
const REPLY_TRANSLATE_COMMAND_REGEXP = new RegExp(
  `^(${PREFIX})( (\\?|\\w+)( \\w+)?)?$`
);
const SLASH_COMMAND_BUILDER = new SlashCommandBuilder()
  .setName('translate')
  .setDescription('Translate text')
  .addStringOption(opt =>
    opt.setName('text').setDescription('Text to translate').setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('to').setDescription('To this language').setAutocomplete(true)
  )
  .addStringOption(opt =>
    opt
      .setName('from')
      .setDescription('From this language')
      .setAutocomplete(true)
  );

module.exports = {
  TRANSLATE_COMMAND_REGEXP,
  REPLY_TRANSLATE_COMMAND_REGEXP,
  SLASH_COMMAND_BUILDER,
};
