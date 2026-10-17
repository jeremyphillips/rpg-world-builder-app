import { describe, expect, it } from 'vitest'

import { accumulateSystemPatch } from './content-write.service'

describe('accumulateSystemPatch', () => {
  it('stores, keeps, and replaces declared tombstones', () => {
    const replaced = accumulateSystemPatch({
      existingPatch: { experiencePointsOverride: 0 },
      update: { challengeRating: '1/8', experiencePointsOverride: null },
      tombstoneKeys: ['experiencePointsOverride'],
    })
    expect(replaced).toEqual({
      experiencePointsOverride: null,
      challengeRating: '1/8',
    })

    const kept = accumulateSystemPatch({
      existingPatch: replaced,
      update: { name: 'Again' },
      tombstoneKeys: ['experiencePointsOverride'],
    })
    expect(kept.experiencePointsOverride).toBeNull()

    const restored = accumulateSystemPatch({
      existingPatch: kept,
      update: { experiencePointsOverride: 0 },
      tombstoneKeys: ['experiencePointsOverride'],
    })
    expect(restored.experiencePointsOverride).toBe(0)
  })

  it('deletes a top-level null when the type does not declare tombstones', () => {
    expect(
      accumulateSystemPatch({
        existingPatch: { name: 'Human', maxCharacterLevel: 5 },
        update: { maxCharacterLevel: null },
      }),
    ).toEqual({ name: 'Human' })
  })

  it('still deletes nested nulls and replaces replace-keys wholesale', () => {
    expect(
      accumulateSystemPatch({
        existingPatch: { movement: { walk: 30, fly: 20 }, languages: { note: 'old' } },
        update: { movement: { walk: 30 }, languages: { entries: [] } },
        replaceKeys: ['movement', 'languages'],
        tombstoneKeys: ['hover'],
      }),
    ).toEqual({
      movement: { walk: 30 },
      languages: { entries: [] },
    })
  })
})
