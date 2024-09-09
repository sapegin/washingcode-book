import tamiaTypeScriptReact from 'eslint-config-tamia/typescript-react';
import markdown from '@eslint/markdown';

export default [
  ...tamiaTypeScriptReact,
  ...markdown.configs.processor,
  {
    rules: {
      // Can't disable these for a particular example because
      // of the prettier-ignore comment
      curly: 'off',
      'no-cond-assign': 'off',
      'no-constant-condition': 'off',
      'no-extra-label': 'off',
      'no-labels': 'off',
      'no-lone-blocks': 'off',
      'no-unreachable': 'off',
      'no-unused-labels': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/no-negation-in-equality-check': 'off',
      'unicorn/prefer-node-protocol': 'off',

      // Many "bad" example use this
      camelcase: 'off',
      eqeqeq: 'off',
      'no-alert': 'off',
      'no-empty': 'off',
      'no-var': 'off',
      'one-var': 'off',
      'prefer-const': 'off',
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-regexp-test': 'off',

      // Some examples use it
      // Most examples define variables or functions
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
];
