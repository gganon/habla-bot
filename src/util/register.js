'use strict';

const logger = require('../util/logger');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../config');
const { SLASH_COMMAND_OBJ } = require('../commands/translate/constants');

const commands = [SLASH_COMMAND_OBJ].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(config.botToken);

const gid = process.argv[2];

for (const i of commands) {
  logger.log(i.name);
}

rest
  .put(
    gid.length
      ? Routes.applicationGuildCommands(config.clientId, gid)
      : Routes.applicationCommands(config.clientId),
    { body: commands }
  )
  .then(() =>
    logger.info(
      'Successfully registered ' +
        commands.length +
        ' application commands' +
        (gid.length ? ' in guild ' + gid : '')
    )
  )
  .catch(logger.error);
