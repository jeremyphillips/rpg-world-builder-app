import { describe, expect, it } from 'vitest'

import { resolveMonsterEquipmentRowProjection } from './resolve-monster-equipment-row-projection.lib'

describe('resolveMonsterEquipmentRowProjection', () => {
  it('omits the attack bonus when challenge rating is blank', () => {
    expect(() =>
      resolveMonsterEquipmentRowProjection({
        entry: { equipmentId: 'missing', quantity: 1 },
        item: undefined,
        abilityScores: {},
        challengeRating: '',
        weaponProficiencies: { categories: [], items: [] },
        omitSharedEnhancement: false,
        provider: () => undefined,
      }),
    ).not.toThrow()
  })
})
