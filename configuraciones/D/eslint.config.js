import * as parserTsStrip from './herramientas/parser-ts-strip.js';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: parserTsStrip,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'max-lines-per-function': ['error', { max: 20, skipBlankLines: true, skipComments: true }],
      complexity: ['error', { max: 5 }],
      'max-depth': ['error', { max: 2 }],
      'max-params': ['error', { max: 3 }],
      'no-magic-numbers': ['error', { ignore: [0, 1, -1], ignoreArrayIndexes: true, ignoreDefaultValues: true }],
      'id-length': ['error', { min: 2 }],
      'no-else-return': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
    },
  },
];
