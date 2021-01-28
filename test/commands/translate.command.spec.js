const { matches, handler } = require('../../src/commands/translate.command');
const { sendTranslation } = require('../../src/message');
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
  mockResult,
  expectedText,
  expectedTranslationOptions
) => {
  const translateSpy = translator.Translator.prototype.translate.mockResolvedValue(
    mockResult
  );

  await handler(message);

  expect(sendTranslation.mock.calls).toHaveLength(1);
  expect(sendTranslation.mock.calls).toEqual([
    [
      MOCK_CHANNEL,
      mockResult.from,
      expectedText,
      mockResult.to,
      mockResult.translation,
    ],
  ]);
  expect(translateSpy.mock.calls).toEqual([
    [expectedText, expectedTranslationOptions],
  ]);
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
      const match = matches(mockMessage('!habla english french', {}));
      expect(match).toEqual(true);
    });
  });

  it('should translate text to default language', async () => {
    await translateTestCase(
      mockMessage('!h Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      {}
    );
  });

  it('should translate text to specified language', async () => {
    await translateTestCase(
      mockMessage('!h en Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { to: 'en' }
    );
  });

  it('should translate text from specified language to specified language', async () => {
    await translateTestCase(
      mockMessage('!h fr en Bonjour'),
      { from: 'French', to: 'English', translation: 'Hi' },
      'Bonjour',
      { from: 'fr', to: 'en' }
    );
  });

  it('should translate multiline text', async () => {
    await translateTestCase(
      mockMessage('!h\nBonjour\nBonjour\nBonjour'),
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
      {
        from: 'French',
        to: 'English',
        translation: 'Hi\nHi\nHi',
      },
      'Bonjour',
      { from: 'french', to: 'english' }
    );
  });
});
