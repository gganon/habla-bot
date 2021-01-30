const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'production',
  botToken: process.env.BOT_TOKEN,
  googleTranslationApiKey: process.env.GOOGLE_TRANSLATION_API_KEY,
  whitelistedServers: process.env.WHITELISTED_SERVERS.split(','),
  defaultLanguage: 'en',
  prefix: '!habla',
  shortPrefix: '!h',
};
