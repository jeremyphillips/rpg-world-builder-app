import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import prettier from 'eslint-config-prettier'

/**
 * Shared base ESLint flat config.
 *
 * Consumers extend this (or `@rpg/config/eslint/react`) and add their own
 * `languageOptions.parserOptions.project` for type-aware rules if desired.
 *
 * Feature-first boundary: each directory under `src/features/*` is an element.
 * Code in one feature may only reach another feature through its public entry
 * (`index.ts` / `index.tsx`); deep cross-feature imports are disallowed.
 * Imports within the same feature are unrestricted.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/node_modules/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: true,
      },
      'boundaries/include': ['**/src/**'],
      'boundaries/elements': [
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['feature'] },
        { type: 'shared', pattern: 'src/!(features)/**', mode: 'full' },
      ],
    },
    rules: {
      // Cross-feature imports must go through a feature's public entry point
      // (index.ts/tsx). Imports within the same feature are unrestricted, and
      // imports to/from shared code or external packages are allowed.
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: { type: 'feature' },
              disallow: {
                to: { type: 'feature', captured: { feature: '!({{from.captured.feature}})' } },
              },
              message:
                'Import another feature only through its public entry point (index.ts), not its internals.',
            },
            {
              from: { type: 'feature' },
              allow: {
                to: {
                  type: 'feature',
                  captured: { feature: '!({{from.captured.feature}})' },
                  internalPath: 'index.@(ts|tsx)',
                },
              },
            },
          ],
        },
      ],
    },
  },
  prettier,
)
