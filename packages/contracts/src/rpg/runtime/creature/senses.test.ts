import { describe, expect, it } from 'vitest'

import type { ContentGrant } from '../../content/lib/grants'
import { resolveCreatureSenses } from './senses'

describe('resolveCreatureSenses', () => {
  it('merges authored senses and sense grants by type, keeping the greater range', () => {
    const grants: ContentGrant[] = [
      { id: 'sense-grant', kind: 'sense', type: 'darkvision', range: 120 },
      { id: 'blindsight', kind: 'sense', type: 'blindsight', range: 30 },
    ]

    expect(
      resolveCreatureSenses({
        authored: [{ type: 'darkvision', range: 60 }],
        grants,
      }),
    ).toEqual([
      { type: 'darkvision', range: 120 },
      { type: 'blindsight', range: 30 },
    ])
  })

  it('returns an empty list when nothing is authored or granted', () => {
    expect(resolveCreatureSenses({})).toEqual([])
  })
})
