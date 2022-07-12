const logger = require('../util/logger');
const translate = require('../commands/translate');
const { checkIfGuildIsAuthorized } = require('../util/guild');

const COMMANDS = [translate];

/**
 *
 * @param {import("discord.js").CommandInteraction | import("discord.js").AutocompleteInteraction} interaction
 * @returns
 */
const interactionHandler = async interaction => {
  const authorized = await checkIfGuildIsAuthorized(interaction.guild);

  if (!authorized) {
    return;
  }

  const command = COMMANDS.find(
    command => command.name === interaction.commandName
  );

  if (interaction.isAutocomplete()) {
    logger.info(
      `Received autocomplete query from "${interaction.user.tag}" in server "${interaction.guild.name}"`
    );

    const opt = interaction.options.getFocused(true);

    if (!command) {
      logger.warn(
        `Autocomplete error: Unknown command "${interaction.commandName}" "${opt.name}:${opt.value}"`
      );
      return;
    }

    if (command.autocomplete) {
      return interaction.respond(command.autocomplete[opt.name](opt.value));
    } else {
      logger.warn(
        `"Autocomplete error: Command "${interaction.commandName}" have autocomplete enabled for option "${opt.name}" but no handler defined for this option`
      );
      return;
    }
  }

  logger.info(
    `Received slash command from "${interaction.user.tag}" in server "${interaction.guild.name}"`
  );

  if (command) {
    logger.info(`Identified command: "${command.name}"`);
    await command.handler(interaction);
  } else {
    logger.error(
      `Unknown slash command: "${interaction.commandName}" "${interaction.commandId}"`
    );
    return interaction.reply(
      'Command not found, might have been removed. We apologize for this incovenience'
    );
  }
};

module.exports = interactionHandler;
