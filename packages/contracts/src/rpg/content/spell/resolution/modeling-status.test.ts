import { describe, expect, it } from 'vitest'

import { ELDRITCH_BLAST_RESOLUTION } from './fixtures'
import { deriveResolutionModelingStatus } from './modeling-status'

describe('deriveResolutionModelingStatus', () => {
  it('returns prose-only when neither effects nor resolution exist', () => {
    expect(deriveResolutionModelingStatus({ effects: undefined })).toBe('prose-only')
    expect(deriveResolutionModelingStatus({ effects: [] })).toBe('prose-only')
  })

  it('returns deferred when effects exist without resolution', () => {
    expect(
      deriveResolutionModelingStatus({
        effects: [{ id: 'fx-1', kind: 'damage', roll: { flat: 1 }, damageType: 'fire' }],
      }),
    ).toBe('deferred')
  })

  it('returns modeled for a single-effect resolution envelope', () => {
    expect(
      deriveResolutionModelingStatus({
        effects: ELDRITCH_BLAST_RESOLUTION.effects,
        resolution: ELDRITCH_BLAST_RESOLUTION,
      }),
    ).toBe('modeled')
  })

  it('returns hybrid when resolution coexists with extra root effects', () => {
    expect(
      deriveResolutionModelingStatus({
        effects: [
          { id: 'fx-1', kind: 'projectile-count', count: 1, unitLabel: 'beams' },
          {
            id: 'fx-2',
            kind: 'damage',
            roll: { dice: { count: 1, faces: 10 } },
            damageType: 'force',
          },
        ],
        resolution: ELDRITCH_BLAST_RESOLUTION,
      }),
    ).toBe('hybrid')
  })
})
