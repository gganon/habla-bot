'use strict';

const logger = require('../util/logger');
const translate = require('../commands/translate');

const COMMANDS = [translate];
/**
 *
 * @param {import('discord.js').AutocompleteInteraction} autocomplete
 */
const autocompleteHandler = autocomplete => {
  const command = COMMANDS.find(r => r.name === autocomplete.commandName);
  if (!command) {
    logger.warn(
      "[AUTOCOMPLETE_ERROR] Unknown command '" + autocomplete.commandName + "'"
    );
    return;
  }
  const opt = autocomplete.options.getFocused(true);
  if (command.autocomplete) {
    return autocomplete.respond(command.autocomplete[opt.name](opt.value));
  } else {
    logger.warn(
      "[AUTOCOMPLETE_ERROR] Command '" +
        autocomplete.commandName +
        "' have autocomplete enabled for option '" +
        opt.name +
        "' but no autocomplete handler defined"
    );
    return;
  }
};

module.exports = {
  autocompleteHandler,
};
