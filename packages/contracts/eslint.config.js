import base from '@rpg/config/eslint/base'

export default [
  ...base,
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared/**', mode: 'full' },
        { type: 'vocab', pattern: 'src/rpg/vocab/**', mode: 'full' },
        { type: 'primitives', pattern: 'src/rpg/primitives/**', mode: 'full' },
        { type: 'runtime', pattern: 'src/rpg/runtime/**', mode: 'full' },
        { type: 'content', pattern: 'src/rpg/content/**', mode: 'full' },
        { type: 'campaign', pattern: 'src/rpg/campaign/**', mode: 'full' },
        { type: 'public', pattern: 'src/public/**', mode: 'full' },
        { type: 'platform-shim', pattern: 'src/platform/**', mode: 'full' },
        { type: 'dev-bench', pattern: 'src/dev-bench/**', mode: 'full' },
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
            { from: ['shared'], allow: ['shared', 'primitives'] },
            { from: ['vocab'], allow: ['vocab'] },
            { from: ['primitives'], allow: ['vocab', 'primitives'] },
            { from: ['content'], allow: ['vocab', 'primitives', 'content'] },
            { from: ['runtime'], allow: ['vocab', 'primitives', 'content', 'runtime'] },
            { from: ['campaign'], allow: ['vocab', 'primitives', 'campaign', 'shared'] },
            { from: ['public'], allow: ['public'] },
            { from: ['platform-shim'], allow: ['shared', 'campaign'] },
            { from: ['dev-bench'], allow: ['dev-bench'] },
            {
              from: ['barrel'],
              allow: ['shared', 'vocab', 'primitives', 'content', 'runtime', 'campaign'],
            },
          ],
        },
      ],
    },
  },
]
