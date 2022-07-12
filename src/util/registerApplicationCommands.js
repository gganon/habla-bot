const logger = require('./logger');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../config');
const translateCommand = require('../commands/translate');

const commands = [translateCommand].map(command => command.builder.toJSON());

const rest = new REST({ version: '9' }).setToken(config.botToken);

const registerApplicationCommands = guildId => {
  logger.info(
    `Registering application commands ${
      guildId ? `in guild ${guildId}` : 'globally'
    }`
  );
  for (const command of commands) {
    logger.info(command.name);
  }
  return rest
    .put(
      guildId
        ? Routes.applicationGuildCommands(config.clientId, guildId)
        : Routes.applicationCommands(config.clientId),
      { body: commands }
    )
    .then(() => {
      logger.info(
        `Successfully registered ${commands.length} application commands ${
          guildId ? `in guild ${guildId}` : 'globally'
        }`
      );
      return true;
    });
};

module.exports = registerApplicationCommands;
