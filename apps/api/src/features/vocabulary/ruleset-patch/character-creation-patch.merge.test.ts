import { describe, expect, it } from 'vitest'

import { mergeProgressionPatch } from './character-creation-patch.merge'

describe('mergeProgressionPatch', () => {
  it('preserves extended progression when patching xp thresholds only', () => {
    const existing = {
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      xpThresholds: { entries: [{ level: 5, xpRequired: 7000 }] },
    }

    expect(
      mergeProgressionPatch(existing, {
        xpThresholds: { entries: [{ level: 5, xpRequired: 8000 }] },
      }),
    ).toEqual({
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      xpThresholds: { entries: [{ level: 5, xpRequired: 8000 }] },
    })
  })

  it('clears extended progression when extendedProgression is null', () => {
    const existing = {
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      xpThresholds: { entries: [{ level: 5, xpRequired: 7000 }] },
    }

    expect(
      mergeProgressionPatch(existing, {
        xpThresholds: { entries: [] },
        extendedProgression: null,
      }),
    ).toEqual({
      xpThresholds: { entries: [] },
    })
  })

  it('updates extended progression without clearing xp thresholds', () => {
    const existing = {
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      xpThresholds: { entries: [{ level: 5, xpRequired: 7000 }] },
    }

    expect(
      mergeProgressionPatch(existing, {
        extendedProgression: { tierName: 'Mythic Tier', maxLevel: 40 },
      }),
    ).toEqual({
      extendedProgression: { tierName: 'Mythic Tier', maxLevel: 40 },
      xpThresholds: { entries: [{ level: 5, xpRequired: 7000 }] },
    })
  })
})
