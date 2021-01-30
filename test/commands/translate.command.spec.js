const { matches, handler } = require('../../src/commands/translate');
const {
  sendTranslation,
  fetchReferencedMessage,
  sendError,
} = require('../../src/message');
const translator = require('../../src/translator');

jest.mock('../../src/message');
jest.mock('../../src/translator.js');

const MOCK_CHANNEL = { id: '8675309' };

const mockMessage = (content, reference) => {
  return {
    channel: MOCK_CHANNEL,
    content,
    reference,
  };
};

const translateTestCase = async (
  message,
  referencedMessage,
  mockResult,
  expectedText,
  expectedTranslationOptions
) => {
  const translateSpy = translator.Translator.prototype.translate.mockResolvedValue(
    mockResult
  );

  if (referencedMessage) {
    fetchReferencedMessage.mockResolvedValue(referencedMessage);
  }

  await handler(message);

  expect(sendTranslation.mock.calls).toHaveLength(1);
  expect(sendTranslation.mock.calls).toEqual([
    [
      message,
      mockResult.from,
      expectedText,
      mockResult.to,
      mockResult.translation,
    ],
  ]);
  expect(translateSpy.mock.calls).toEqual([
    [expectedText, expectedTranslationOptions],
  ]);

  if (referencedMessage) {
    expect(fetchReferencedMessage.mock.calls).toEqual([[message]]);
  }
};

describe('Translation Command', () => {
  describe('should identify translation request messages', () => {
    it('without languages', () => {
      const match = matches(mockMessage('!h pls translate this'));
      expect(match).toEqual(true);
    });

    it('with "to" language specified', () => {
      const match = matches(mockMessage('!h fr pls translate this'));
      expect(match).toEqual(true);
    });

    it('with "to" and "from" languages specified', () => {
      const match = matches(mockMessage('!h en fr pls translate this'));
      expect(match).toEqual(true);
    });

    it('incorrect usage: missing arguments', () => {
      const match = matches(mockMessage('!h'));
      expect(match).toEqual(false);
    });

    it('should translate multiline text', () => {
      const match = matches(
        mockMessage('!h en fr\npls translate this\nand this\nand this')
      );
      expect(match).toEqual(true);
    });

    it('reply translation request', () => {
      const match = matches(mockMessage('!h', {}));
      expect(match).toEqual(true);
    });

    it('reply request with "to" language specified', () => {
      const match = matches(mockMessage('!h en', {}));
      expect(match).toEqual(true);
    });

    it('reply request with "from" and "to" languages specified', () => {
      const match = matches(mockMessage('!h en fr', {}));
      expect(match).toEqual(true);
    });

    it('should accept long prefix as well', () => {
      const match = matches(mockMessage('!habla en fr'));
      expect(match).toEqual(true);
    });

    it('should accept long prefix for reply', () => {
      const match = matches(mockMessage('!habla en fr', {}));
      expect(match).toEqual(true);
    });

    it('should match long language format', () => {
      const match = matches(mockMessage('!habla english french'));
      expect(match).toEqual(true);
    });

    it('should match long language format for reply', () => {
      const match = matches(mockMessage('!habla english french', {}));
      expect(match).toEqual(true);
    });
  });

  it('should translate text to default language', async () => {
    await translateTestCase(
      mockMessage('!h Bonjour'),
      null,
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      {}
    );
  });

  it('should translate text to specified language', async () => {
    await translateTestCase(
      mockMessage('!h en Bonjour'),
      null,
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { to: 'en' }
    );
  });

  it('should translate text from specified language to specified language', async () => {
    await translateTestCase(
      mockMessage('!h fr en Bonjour'),
      null,
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { from: 'fr', to: 'en' }
    );
  });

  it('should translate multiline text', async () => {
    await translateTestCase(
      mockMessage('!h\nBonjour\nBonjour\nBonjour'),
      null,
      {
        from: 'French',
        to: 'English',
        translation: 'Hi\nHi\nHi',
      },
      'Bonjour\nBonjour\nBonjour',
      {}
    );
  });

  it('should translate long language format', async () => {
    await translateTestCase(
      mockMessage('!h french english Bonjour'),
      null,
      {
        from: 'French',
        to: 'English',
        translation: 'Hi',
      },
      'Bonjour',
      { from: 'french', to: 'english' }
    );
  });

  it('should translate reply reference to default language', async () => {
    await translateTestCase(
      mockMessage('!h', { messageID: '1234' }),
      mockMessage('Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      {}
    );
  });

  it('should translate reply reference to specified language', async () => {
    await translateTestCase(
      mockMessage('!h en', { messageID: '1234' }),
      mockMessage('Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { to: 'en' }
    );
  });

  it('should translate reply reference from specified language to specified language', async () => {
    await translateTestCase(
      mockMessage('!h fr en', { messageID: '1234' }),
      mockMessage('Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { from: 'fr', to: 'en' }
    );
  });

  it('should translate reply reference with long language format', async () => {
    await translateTestCase(
      mockMessage('!h french english', { messageID: '1234' }),
      mockMessage('Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { from: 'french', to: 'english' }
    );
  });

  it('should accept long prefix', async () => {
    await translateTestCase(
      mockMessage('!habla fr en Bonjour'),
      null,
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { from: 'fr', to: 'en' }
    );
  });

  it('should accept long prefix for reply', async () => {
    await translateTestCase(
      mockMessage('!habla fr en', { messageID: '1234' }),
      mockMessage('Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { from: 'fr', to: 'en' }
    );
  });

  it('should handle translation API errors', async () => {
    const mockError = new translator.GoogleApiError({
      data: {
        error: {
          code: 400,
          message: 'Invalid Value',
          errors: [
            {
              message: 'Invalid Value',
              domain: 'global',
              reason: 'invalid',
            },
          ],
        },
      },
    });

    translator.Translator.prototype.translate.mockRejectedValue(mockError);

    await handler(mockMessage('!h Bonjour'));

    expect(sendError.mock.calls).toEqual([
      [
        MOCK_CHANNEL,
        `Google Translation Error: ${mockError.message}`,
        '```json\n' + JSON.stringify(mockError.details, null, 2) + '\n```',
      ],
    ]);
  });

  it('should handle other translation errors', async () => {
    const mockError = new Error('Oop');
    translator.Translator.prototype.translate.mockRejectedValue(mockError);

    await handler(mockMessage('!h Bonjour'));

    expect(sendError.mock.calls).toEqual([
      [MOCK_CHANNEL, mockError.message, undefined],
    ]);
  });
});
