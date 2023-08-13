module.exports = {
  env: {
    node: true,
  },
  plugins: [
    'node',
  ],
  extends: [
    'plugin:node/recommended',
  ],
  rules: {
    'no-var': 'error',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    indent: ['error', 2],
    'comma-dangle': ['error', 'always-multiline'],
    'max-len': ['error', { code: 80 }],
    'no-console': 'off',
  },
  parserOptions: {
    ecmaVersion: 6,
  },
};
