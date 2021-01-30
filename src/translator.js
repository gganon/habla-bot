const config = require('./config');
const axios = require('axios');
const ISO6391 = require('iso-639-1');
const logger = require('./util/logger');

const GOOGLE_TRANSLATION_API_BASE_URL =
  'https://translation.googleapis.com/language/translate/v2';

class GoogleTranslator {
  constructor(options) {
    this.defaultLanguage = options?.defaultLanguage || config.defaultLanguage;
    this.apiKey = config.googleTranslationApiKey;
  }

  async translate(text, options) {
    let source, target;

    if (options?.from) {
      source = this._getISOLanguageCode(options.from);
    }

    if (options?.to) {
      target = this._getISOLanguageCode(options.to);
    } else {
      target = this.defaultLanguage;
    }

    const translationOptions = { source, target };

    const {
      translatedText,
      detectedSourceLanguage,
    } = await this._googleTranslateBasic(text, translationOptions);

    const from = ISO6391.getName(
      translationOptions.source || detectedSourceLanguage
    );

    const to = ISO6391.getName(translationOptions.target);

    return {
      translation: translatedText,
      from,
      to,
    };
  }

  async _googleTranslateBasic(text, options) {
    try {
      const response = await axios.post(
        GOOGLE_TRANSLATION_API_BASE_URL,
        {},
        {
          params: {
            key: this.apiKey,
            format: 'text',
            q: text,
            source: options.source,
            target: options.target,
          },
        }
      );

      return response.data.data.translations[0];
    } catch (e) {
      if (e.response) {
        const err = new GoogleApiError(e.response);
        logger.error(
          `Google Translation API Error: ${JSON.stringify(
            err.details,
            null,
            2
          )}`
        );
        logger.error(err);
        throw err;
      } else {
        logger.error(`Google Translation API Error: ${e.message}`);
        throw e;
      }
    }
  }

  _getISOLanguageCode(language) {
    return ISO6391.getCode(language) || language; // if `language` was already an ISO-639-1 code, getCode() will return '' and return value will be defaulted to `language` itself
  }
}

class GoogleApiError extends Error {
  constructor(response) {
    super(
      response?.data?.error?.message ||
        'Unexpected Google Translation API Error'
    );
    this.details = response.data.error;
  }
}

module.exports = {
  Translator: GoogleTranslator,
  GoogleApiError,
};
