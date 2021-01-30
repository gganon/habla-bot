const logger = require('../util/logger');
const config = require('../config');

const UNAUTHORIZED_INVITE_WARNING = `Hi there! I'm a bot!
I was recently added to your server "{{guild_name}}" by one of your members.
Unfortunately, I am a private bot developed for private use by my owner and I am not authorized to be added to your server so I will be leaving your server.
Sorry about that. Have a nice day!`;

const informUnauthorizedInvite = async guild => {
  const owner = await guild.members.fetch(guild.ownerID);
  await owner.send(
    UNAUTHORIZED_INVITE_WARNING.replace('{{guild_name}}', guild.name)
  );
};

const checkIfGuildIsAuthorized = async guild => {
  if (!config.whitelistedServers.includes(guild.id)) {
    logger.warn(
      `Server "${guild.name}" (${guild.id}) is not whitelisted! Informing owner about this event...`
    );

    try {
      await informUnauthorizedInvite(guild);
      logger.warn(
        `Informed owner of "${guild.name}" (${guild.id}) about this event`
      );
    } catch (e) {
      logger.error(
        `Error while trying to inform owner of "${guild.name}" (${guild.id}) about unauthorized invite`
      );
      logger.error(e);
    }

    logger.warn(`Leaving server "${guild.name}" (${guild.id})...`);
    await guild.leave();
  }
};

module.exports = {
  checkIfGuildIsAuthorized,
};
