const config = require('../config');
const axios = require('axios');
const ISO6391 = require('iso-639-1');
const logger = require('../util/logger');
const { GoogleApiError } = require('./google-api.error');

const GOOGLE_TRANSLATION_API_BASE_URL =
  'https://translation.googleapis.com/language/translate/v2';

class GoogleTranslator {
  constructor(options) {
    this.defaultLanguage = options?.defaultLanguage || config.defaultLanguage;
    this.apiKey = config.googleTranslationApiKey;
    this._cachedSupportedLanguages = [];
    this._fetcherInterval;
    this._initialized = false;
  }

  async init(force) {
    if (!force && this._initialized) {
      throw new Error('This instance is already initialized!');
    }

    const fetcher = async () => {
      this.getSupportedLanguages().then(result =>
        console.log(`Fetched ${result.length} supported languages`)
      );
    };

    await fetcher();

    this._fetcherInterval = setInterval(fetcher, 24 * 60 * 60 * 1000);
    this._initialized = true;
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
      this._handleAxiosError(e);
    }
  }

  _getISOLanguageCode(language) {
    return ISO6391.getCode(language) || language; // if `language` was already an ISO-639-1 code, getCode() will return '' and return value will be defaulted to `language` itself
  }

  _getISOLanguageName(code) {
    return {
      name: ISO6391.getName(code) || '',
      native: ISO6391.getNativeName(code) || '',
    }; // if `language` was already an ISO-639-1 code, getCode() will return '' and return value will be defaulted to `language` itself
  }

  async getSupportedLanguages() {
    try {
      const response = await axios.post(
        GOOGLE_TRANSLATION_API_BASE_URL + '/languages',
        {},
        {
          params: {
            key: this.apiKey,
          },
        }
      );

      const languages = response.data.data.languages.map(data => {
        const fullData = this._getISOLanguageName(data.language);
        fullData.code = data.language;
        return fullData;
      });

      this._cachedSupportedLanguages = languages;

      return this._cachedSupportedLanguages;
    } catch (e) {
      this._handleAxiosError(e);
    }
  }

  getCachedSupportedLanguages() {
    return this._cachedSupportedLanguages;
  }

  _handleAxiosError(e) {
    if (e.response) {
      const err = new GoogleApiError(e.response);
      logger.error(
        `Google Translation API Error: ${JSON.stringify(err.details, null, 2)}`
      );
      logger.error(err);
      throw err;
    } else {
      logger.error(`Google Translation API Error: ${e.message}`);
      throw e;
    }
  }
}

module.exports = {
  Translator: GoogleTranslator,
};
