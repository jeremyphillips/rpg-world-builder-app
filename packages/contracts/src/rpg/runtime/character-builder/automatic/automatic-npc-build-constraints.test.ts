import { describe, expect, it } from 'vitest'

import {
  canonicalizeAutomaticNpcBuildConstraints,
  normalizeAutomaticNpcBuildConstraints,
} from './automatic-npc-build-constraints'

describe('automaticNpcBuildConstraints', () => {
  it('canonicalizes unordered requirement sets by stable id sort', () => {
    expect(
      canonicalizeAutomaticNpcBuildConstraints({
        requiredWeaponIds: ['weapon-b', 'weapon-a', 'weapon-b'],
        requiredSpellIds: ['spell-z', 'spell-a'],
      }),
    ).toEqual({
      requiredWeaponIds: ['weapon-a', 'weapon-b'],
      requiredSpellIds: ['spell-a', 'spell-z'],
    })
  })

  it('returns undefined when both arrays are empty after normalization', () => {
    expect(
      normalizeAutomaticNpcBuildConstraints({
        requiredWeaponIds: [],
        requiredSpellIds: [],
      }),
    ).toBeUndefined()
  })
})
