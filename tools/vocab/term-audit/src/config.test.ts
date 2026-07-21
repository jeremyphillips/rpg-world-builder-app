import { describe, expect, it } from 'vitest'

import { findConfigEntry, matchesGlob } from './config'

describe('term audit configuration', () => {
  it('matches ignore globs and target-scoped contextual entries', () => {
    expect(matchesGlob('apps/dashboard/src/example.stories.tsx', '**/*.stories.tsx')).toBe(true)
    expect(
      findConfigEntry(
        {
          ignore: [],
          contextual: [
            {
              target: 'content-type:species',
              path: 'apps/dashboard/**',
              reason: 'Workflow prose',
              owner: 'dashboard',
            },
          ],
        },
        'content-type:species',
        'apps/dashboard/src/example.tsx',
      ),
    ).toMatchObject({ owner: 'dashboard' })
  })
})
