const { Translator, GoogleApiError } = require('../src/translator');
const axios = require('axios');

const MOCK_API_KEY = 'fake_key';

jest.mock('axios');
jest.mock('../src/config', () => {
  return {
    googleTranslationApiKey: 'fake_key',
    defaultLanguage: 'en',
  };
});

const mockApiResponse = (translatedText, detectedSourceLanguage) => {
  axios.post.mockResolvedValue({
    data: {
      data: {
        translations: [
          {
            translatedText,
            detectedSourceLanguage,
          },
        ],
      },
    },
  });
};

const assertApiRequest = (requestArgs, params) => {
  expect(requestArgs).toEqual([
    'https://translation.googleapis.com/language/translate/v2',
    {},
    {
      params: {
        ...params,
        key: MOCK_API_KEY,
      },
    },
  ]);
};

describe('Translator', () => {
  let translator;

  beforeEach(() => {
    translator = new Translator();
  });

  it('should translate text to default language', async () => {
    mockApiResponse('Hello', 'fr');

    const result = await translator.translate('Bonjour');

    expect(result).toEqual({
      translation: 'Hello',
      from: 'French',
      to: 'English',
    });

    const axiosArguments = axios.post.mock.calls[0];

    assertApiRequest(axiosArguments, { target: 'en', q: 'Bonjour' });
  });

  it('should translate text to specified language', async () => {
    mockApiResponse('Hallo', 'fr');

    const result = await translator.translate('Bonjour', { to: 'de' });

    expect(result).toEqual({
      translation: 'Hallo',
      from: 'French',
      to: 'German',
    });

    const axiosArguments = axios.post.mock.calls[0];

    assertApiRequest(axiosArguments, { target: 'de', q: 'Bonjour' });
  });

  it('should translate text from specified language to specified language', async () => {
    mockApiResponse('Hallo');

    const result = await translator.translate('Hello', {
      from: 'en',
      to: 'de',
    });

    expect(result).toEqual({
      translation: 'Hallo',
      from: 'English',
      to: 'German',
    });

    const axiosArguments = axios.post.mock.calls[0];

    assertApiRequest(axiosArguments, {
      target: 'de',
      source: 'en',
      q: 'Hello',
    });
  });

  it('should support full english language names', async () => {
    mockApiResponse('Hallo');

    const result = await translator.translate('Hello', {
      from: 'english',
      to: 'german',
    });

    expect(result).toEqual({
      translation: 'Hallo',
      from: 'English',
      to: 'German',
    });

    const axiosArguments = axios.post.mock.calls[0];

    assertApiRequest(axiosArguments, {
      target: 'de',
      source: 'en',
      q: 'Hello',
    });
  });

  it('should throw error google API error', async () => {
    const error = {
      code: 400,
      message: 'Invalid Value',
      errors: [
        {
          message: 'Invalid Value',
          domain: 'global',
          reason: 'invalid',
        },
      ],
    };

    axios.post.mockRejectedValue({
      response: {
        data: {
          error,
        },
      },
    });

    try {
      await translator.translate('Bonjour');
      fail('Should have thrown error');
    } catch (e) {
      expect(e).toBeInstanceOf(GoogleApiError);
      expect(e.details).toEqual(error);
    }
  });
});
