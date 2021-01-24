const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'production',
  botToken: process.env.BOT_TOKEN,
  googleTranslationApiKey: process.env.GOOGLE_TRANSLATION_API_KEY,
  defaultLanguage: 'en',
};
