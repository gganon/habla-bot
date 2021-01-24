const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  googleTranslationApiKey: process.env.GOOGLE_TRANSLATION_API_KEY,
};
