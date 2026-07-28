import base from '@rpg/config/eslint/base'

export default [
  ...base,
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    settings: {
      'boundaries/elements': [
        { type: 'validation', pattern: 'src/validation/**', mode: 'full' },
        { type: 'shared', pattern: 'src/shared/**', mode: 'full' },
        { type: 'vocab', pattern: 'src/rpg/vocab/**', mode: 'full' },
        { type: 'primitives', pattern: 'src/rpg/primitives/**', mode: 'full' },
        { type: 'runtime', pattern: 'src/rpg/runtime/**', mode: 'full' },
        { type: 'content', pattern: 'src/rpg/content/**', mode: 'full' },
        { type: 'campaign', pattern: 'src/rpg/campaign/**', mode: 'full' },
        {
          type: 'character-builder',
          pattern: 'src/rpg/character-builder/**',
          mode: 'full',
        },
        { type: 'public', pattern: 'src/public/**', mode: 'full' },
        { type: 'dev-bench', pattern: 'src/dev-bench/**', mode: 'full' },
        {
          type: 'character-import',
          pattern: 'src/character-import/**',
          mode: 'full',
        },
        {
          type: 'name-generator',
          pattern: 'src/name-generator/**',
          mode: 'full',
        },
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
            { from: ['validation'], allow: ['validation'] },
            { from: ['shared'], allow: ['validation', 'shared', 'primitives'] },
            { from: ['vocab'], allow: ['validation', 'vocab'] },
            { from: ['primitives'], allow: ['validation', 'vocab', 'primitives'] },
            { from: ['character-builder'], allow: ['validation', 'character-builder'] },
            { from: ['content'], allow: ['validation', 'vocab', 'primitives', 'content'] },
            {
              from: ['runtime'],
              allow: [
                'validation',
                'vocab',
                'primitives',
                'content',
                'runtime',
                'campaign',
                'character-builder',
              ],
            },
            {
              from: ['campaign'],
              allow: [
                'validation',
                'vocab',
                'primitives',
                'campaign',
                'shared',
                'character-builder',
              ],
            },
            { from: ['public'], allow: ['public'] },
            { from: ['dev-bench'], allow: ['dev-bench'] },
            {
              from: ['character-import'],
              allow: ['validation', 'vocab', 'primitives', 'runtime', 'character-import'],
            },
            {
              from: ['name-generator'],
              allow: ['validation', 'vocab', 'name-generator'],
            },
            {
              from: ['barrel'],
              allow: [
                'validation',
                'shared',
                'vocab',
                'primitives',
                'content',
                'runtime',
                'campaign',
                'character-builder',
              ],
            },
          ],
        },
      ],
    },
  },
]
