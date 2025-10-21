import tamiaTypeScriptReact from 'eslint-config-tamia/typescript-react';
import markdown from '@eslint/markdown';
import tseslint from 'typescript-eslint';

export default [
  ...tamiaTypeScriptReact,
  ...markdown.configs.processor,
  {
    files: ['**/*.md/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        // Disable types because they don't work in Markdown files
        projectService: false
      }
    },
    rules: {
      // Disable rules that require types
      ...tseslint.configs.disableTypeChecked.rules,

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
      'unicorn/no-array-sort': 'off',
      'unicorn/no-negation-in-equality-check': 'off',
      'unicorn/no-nested-ternary': 'off',
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
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-regexp-test': 'off',
      'washing-code/explicit-boolean-check': 'off',

      // Most examples define variables or functions
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    ignores: ['samples/', 'generator/', 'ai/Rules.md']
  }
];
