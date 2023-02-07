const { LoremIpsum } = require('lorem-ipsum');
const { matches, handler } = require('../../src/commands/translate');
const {
  sendTranslation,
  sendError,
} = require('../../src/commands/translate/translate.command.js');
const translator = require('../../src/translator');

jest.mock('../../src/util/logger'); // silence logs
jest.mock('../../src/commands/translate/translate.command.js');
jest.mock('../../src/translator.js');
jest.mock('../../src/config', () => {
  return {
    prefix: '!habla',
    shortPrefix: '!h',
    charLimit: 500,
  };
});

const mockMessage = (content, reference) => {
  return {
    channel: {
      id: '8675309',
      send: jest.fn(),
    },
    content,
    reference,
    reply: jest.fn(),
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
    message.fetchReference = jest
      .fn()
      .mockImplementation(async () => referencedMessage);
  }

  await handler(message);

  const expectedHeader = `Translated from ${mockResult.from} to ${mockResult.to}`;
  const expectedTranslation = mockResult.translation;
  expect(message.reply).toBeCalledWith(expect.stringMatching(expectedHeader));
  expect(message.reply).toBeCalledWith(expect.stringMatching(expectedText));
  expect(message.reply).toBeCalledWith(
    expect.stringMatching(expectedTranslation)
  );

  expect(translateSpy.mock.calls).toEqual([
    [expectedText, expectedTranslationOptions],
  ]);

  if (referencedMessage) {
    expect(message.fetchReference).toHaveBeenCalled();
  }
};

describe('Translation Command', () => {
  describe('should identify translation request messages', () => {
    it('should match request with "to" and "from" languages specified', () => {
      const match = matches(mockMessage('!h en fr pls translate this'));
      expect(match).toEqual(true);
    });

    it('should match request with unknown "from" language', () => {
      const match = matches(mockMessage('!h ? fr pls translate this'));
      expect(match).toEqual(true);
    });

    it('should not match incorrect usage', () => {
      let match = matches(mockMessage('!h'));
      expect(match).toEqual(false);
      match = matches(mockMessage('!h en'));
      expect(match).toEqual(false);
      match = matches(mockMessage('!h en fr'));
      expect(match).toEqual(false);
    });

    it('should translate multiline text', () => {
      const match = matches(
        mockMessage('!h en fr\npls translate this\nand this\nand this')
      );
      expect(match).toEqual(true);
    });

    it('should match reply translation request', () => {
      const match = matches(mockMessage('!h', {}));
      expect(match).toEqual(true);
    });

    it('should match reply translation request with to language', () => {
      const match = matches(mockMessage('!h fr', {}));
      expect(match).toEqual(true);
    });

    it('should match reply request with "from" and "to" languages specified', () => {
      const match = matches(mockMessage('!h en fr', {}));
      expect(match).toEqual(true);
    });

    it('should match reply request with unknown "from" language', () => {
      const match = matches(mockMessage('!h ? fr', {}));
      expect(match).toEqual(true);
    });

    it('should not match incorrect usage for reply', () => {
      let match = matches(mockMessage('!h en'));
      expect(match).toEqual(false);
      match = matches(mockMessage('!h en fr'));
      expect(match).toEqual(false);
    });

    it('should accept long prefix as well', () => {
      const match = matches(mockMessage('!habla en fr pls translate this'));
      expect(match).toEqual(true);
    });

    it('should accept long prefix for reply', () => {
      const match = matches(mockMessage('!habla en fr', {}));
      expect(match).toEqual(true);
    });

    it('should match long language format', () => {
      const match = matches(
        mockMessage('!habla english french pls translate this')
      );
      expect(match).toEqual(true);
    });

    it('should match long language format for reply', () => {
      const match = matches(mockMessage('!habla english french', {}));
      expect(match).toEqual(true);
    });
  });

  it('should translate text from specified language to specified language', async () => {
    await translateTestCase(
      mockMessage('!h fr en Bonjour mon ami'),
      null,
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { from: 'fr', to: 'en' }
    );
  });

  it('should translate with unknown "from" language', async () => {
    await translateTestCase(
      mockMessage('!h ? en Bonjour mon ami'),
      null,
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { to: 'en' }
    );
  });

  it('should translate multiline text', async () => {
    await translateTestCase(
      mockMessage(
        '!h fr en\nBonjour mon ami\nBonjour mon ami\nBonjour mon ami'
      ),
      null,
      {
        from: 'French',
        to: 'English',
        translation: 'Hello my friend\nHello my friend\nHello my friend',
      },
      'Bonjour mon ami\nBonjour mon ami\nBonjour mon ami',
      { from: 'fr', to: 'en' }
    );
  });

  it('should translate long language format', async () => {
    await translateTestCase(
      mockMessage('!h french english Bonjour mon ami'),
      null,
      {
        from: 'French',
        to: 'English',
        translation: 'Hello my friend',
      },
      'Bonjour mon ami',
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
      mockMessage('Bonjour mon ami'),
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { to: 'en' }
    );
  });

  it('should translate reply reference from specified language to specified language', async () => {
    await translateTestCase(
      mockMessage('!h fr en', { messageID: '1234' }),
      mockMessage('Bonjour mon ami'),
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { from: 'fr', to: 'en' }
    );
  });

  it('should translate reply reference with unknown from language', async () => {
    await translateTestCase(
      mockMessage('!h ? en', { messageID: '1234' }),
      mockMessage('Bonjour mon ami'),
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { to: 'en' }
    );
  });

  it('should translate reply reference with long language format', async () => {
    await translateTestCase(
      mockMessage('!h french english', { messageID: '1234' }),
      mockMessage('Bonjour mon ami'),
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { from: 'french', to: 'english' }
    );
  });

  it('should accept long prefix', async () => {
    await translateTestCase(
      mockMessage('!habla fr en Bonjour mon ami'),
      null,
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { from: 'fr', to: 'en' }
    );
  });

  it('should accept long prefix for reply', async () => {
    await translateTestCase(
      mockMessage('!habla fr en', { messageID: '1234' }),
      mockMessage('Bonjour mon ami'),
      { from: 'French', to: 'English', translation: 'Hello my friend' },
      'Bonjour mon ami',
      { from: 'fr', to: 'en' }
    );
  });

  it('should handle mentions being messed by Google Translate', async () => {
    const message = mockMessage(
      '!h fr en Bonjour <@!123456789012345678> <@!123456789012345678>'
    );
    const mockResult = {
      from: 'French',
      to: 'English',
      translation: 'Hello <@! 123456789012345678> <@! 123456789012345678>', // Google Translate adds an unwanted space in the mention
    };

    translator.Translator.prototype.translate.mockResolvedValue(mockResult);
    await handler(message);

    expect(sendTranslation.mock.calls).toEqual([
      [
        message,
        mockResult.from,
        'Bonjour <@!123456789012345678> <@!123456789012345678>',
        mockResult.to,
        'Hello <@!123456789012345678> <@!123456789012345678>', // expecting space to be fixed
      ],
    ]);
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

    const message = mockMessage('!h fr en Bonjour');
    await handler(message);

    expect(sendError.mock.calls).toEqual([
      [
        message.channel,
        `Google Translation Error: ${mockError.message}`,
        '```json\n' + JSON.stringify(mockError.details, null, 2) + '\n```',
      ],
    ]);
  });

  it('should handle other translation errors', async () => {
    const mockError = new Error('Oop');
    translator.Translator.prototype.translate.mockRejectedValue(mockError);

    const message = mockMessage('!h fr en Bonjour');
    await handler(message);

    expect(sendError.mock.calls).toEqual([
      [message.channel, mockError.message, undefined],
    ]);
  });

  it('should ignore messages above 500 characters', async () => {
    const lorem = new LoremIpsum();
    const message = mockMessage(`!h ? en ${lorem.generateWords(200)}`);
    await handler(message);

    expect(message.channel.send.mock.calls).toEqual([
      ['That message is too long! Please limit your text to 500 characters.'],
    ]);
  });

  it('should normalize unicode characters', async () => {
    await translateTestCase(
      mockMessage('!h en fr 𝚠𝚘𝚠 𝚝𝚑𝚊𝚝𝚜 𝚊𝚖𝚊𝚣𝚒𝚗𝚐'),
      null,
      {
        from: 'French',
        to: 'French',
        translation: "Wouh, c'est dingue",
      },
      'wow thats amazing',
      { from: 'en', to: 'fr' }
    );
  });
});
