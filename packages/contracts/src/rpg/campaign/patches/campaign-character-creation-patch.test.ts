import { describe, expect, it } from 'vitest'

import { resolveCharacterCreationPatch } from './campaign-character-creation-patch'

describe('resolveCharacterCreationPatch', () => {
  it('keeps standard max level separate from extended progression on resolved reads', () => {
    const resolved = resolveCharacterCreationPatch({
      progression: {
        maxCharacterLevel: 20,
        extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      },
    })

    expect(resolved.progression).toEqual({
      maxCharacterLevel: 20,
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
    })
  })
})
