'use strict';

const TRANSLATION_HEADER = '_(Translated from {{from}} to {{to}})_:\n\n';
const TRANSLATION_HEADER_REGEXP = /_\(Translated from \w+ to \w+\)_:\n\n/;

module.exports = {
  TRANSLATION_HEADER,
  TRANSLATION_HEADER_REGEXP,
};
