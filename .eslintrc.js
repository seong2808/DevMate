module.exports = {
  env: {
    node: true,
  },
  plugins: [
    'node',
  ],
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',  // TypeScript 권장 설정 사용
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
    ecmaVersion: 'latest',
  },
};
