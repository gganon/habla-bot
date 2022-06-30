const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'production',
  botToken: process.env.BOT_TOKEN,
  googleTranslationApiKey: process.env.GOOGLE_TRANSLATION_API_KEY,
  whitelistedServers: process.env.WHITELISTED_SERVERS.split(',').filter(
    r => !!r
  ),
  defaultLanguage: 'en',
  prefix: process.env.BOT_PREFIX || '!habla',
  shortPrefix: process.env.BOT_SHORT_PREFIX || '!h',
  charLimit: 500,
};
