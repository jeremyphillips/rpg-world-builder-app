import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { resolveCharacterEquipmentRowProjection } from './resolve-character-equipment-row-projection.lib'

describe('resolveCharacterEquipmentRowProjection', () => {
  it('projects attack and damage for a proficient weapon at level 1', () => {
    const dagger = pickEquipment('dagger')
    if (dagger.kind !== 'weapon') throw new Error('expected weapon')

    const summary = resolveCharacterEquipmentRowProjection({
      entry: { entryId: 'e1', equipmentId: dagger.id, quantity: 1 },
      item: dagger,
      abilityScores: { dex: 14 },
      level: 1,
      weaponProficiencyTargets: [{ weaponId: dagger.id }],
      omitSharedEnhancement: false,
      provider: () => undefined,
    })

    expect(summary?.attackBonus).toBe(4)
    expect(summary?.damage?.expression).toBe('1d4+2')
  })
})
