import base from '@rpg/config/eslint/base'

export default [
  ...base,
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    settings: {
      'boundaries/elements': [
        { type: 'vocab', pattern: 'src/vocab/**', mode: 'full' },
        { type: 'primitives', pattern: 'src/primitives/**', mode: 'full' },
        { type: 'content', pattern: 'src/content/**', mode: 'full' },
        { type: 'platform', pattern: 'src/platform/**', mode: 'full' },
        { type: 'barrel', pattern: 'src/index.ts', mode: 'file' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '${file.type} must not import ${dependency.type} (${dependency.source}). See packages/contracts/docs/structure.md.',
          rules: [
            { from: ['vocab'], allow: ['vocab'] },
            { from: ['primitives'], allow: ['vocab', 'primitives'] },
            { from: ['content'], allow: ['vocab', 'primitives', 'content'] },
            { from: ['platform'], allow: ['vocab', 'primitives', 'platform'] },
            { from: ['barrel'], allow: ['vocab', 'primitives', 'content', 'platform'] },
          ],
        },
      ],
    },
  },
]
