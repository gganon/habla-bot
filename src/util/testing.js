'use strict';

const _isTesting = process.env.NODE_ENV === 'test';

const getMockFunc = fn => (_isTesting ? jest.fn(fn) : fn);

module.exports = {
  getMockFunc,
};
