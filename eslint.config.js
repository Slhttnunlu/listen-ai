const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  { ignores: ['dist/**', 'ios/**', 'local-tts-server/**', 'node_modules/**'] },
  ...expoConfig,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/__tests__/**/*.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
