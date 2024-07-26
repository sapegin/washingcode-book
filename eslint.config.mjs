import tamiaTypeScript from 'eslint-config-tamia/typescript';

export default [
  ...tamiaTypeScript,
  {
    files: ['.textlintrc.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'unicorn/prefer-module': 'off'
    }
  }
];
