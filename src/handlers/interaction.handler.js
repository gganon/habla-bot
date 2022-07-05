'use strict';

const config = require('../config');
const logger = require('../util/logger');
const translate = require('../commands/translate');
const { checkIfGuildIsAuthorized } = require('../util/guild');
const { autocompleteHandler } = require('./autocomplete.handler');

const COMMANDS = [translate];

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 * @returns
 */
const interactionHandler = async interaction => {
  const authorized = await checkIfGuildIsAuthorized(interaction.guild);

  if (!authorized) {
    return;
  }

  if (interaction.isAutocomplete()) {
    logger.info(
      `Received autocomplete query from "${interaction.user.tag}" in server "${interaction.guild.name}"`
    );
    return autocompleteHandler(interaction);
  }

  logger.info(
    `Received slash command from "${interaction.user.tag}" in server "${interaction.guild.name}"`
  );

  const command = COMMANDS.find(r => r.name === interaction.commandName);

  if (command) {
    logger.info(`Identified command: "${command.name}"`);
    await command.interactionHandler(interaction);
  } else {
    logger.info('Unknown command. Sending default message');
    return interaction.reply(
      `Try \`${config.prefix} help\` or \`${config.shortPrefix} help\``
    );
  }
};

module.exports = interactionHandler;
