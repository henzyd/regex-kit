import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.tgz']
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // Type-aware linting covers the source trees. Root config files that are not
    // part of tsconfig are left to the untyped rules above.
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // A validation library matches control characters and invisible Unicode on purpose.
      'no-control-regex': 'off',
      'no-irregular-whitespace': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  {
    files: ['test/**/*.ts'],
    rules: { 'no-console': 'off' }
  },

  {
    // Repository scripts are Node programs, not part of the published package.
    files: ['.github/scripts/**/*.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' }
    },
    rules: { 'no-console': 'off' }
  },

  // Must stay last so it can switch off anything that fights the formatter.
  prettier
);
