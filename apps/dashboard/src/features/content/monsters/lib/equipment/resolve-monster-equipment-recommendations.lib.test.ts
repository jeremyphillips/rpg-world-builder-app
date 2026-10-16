import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { resolveMonsterEquipmentWeaponRecommendations } from './resolve-monster-equipment-recommendations.lib'

describe('resolveMonsterEquipmentWeaponRecommendations', () => {
  const rulesetId = 'srd-cc-5.2.1' as const
  const dagger = pickEquipment('dagger')
  const shortsword = pickEquipment('shortsword')
  const shortbow = pickEquipment('shortbow')
  const referenceEquipment = [dagger, shortsword, shortbow]

  it('returns no recommendations when proficiency items are empty', () => {
    expect(
      resolveMonsterEquipmentWeaponRecommendations({
        weaponProficiencyItemIds: [],
        referenceEquipment,
        equipmentEntries: [],
        rulesetId,
      }),
    ).toEqual([])
  })

  it('preserves proficiency selection order', () => {
    const result = resolveMonsterEquipmentWeaponRecommendations({
      weaponProficiencyItemIds: [shortbow.id, dagger.id, shortsword.id],
      referenceEquipment,
      equipmentEntries: [],
      rulesetId,
    })
    expect(result.map((row) => row.equipmentId)).toEqual([shortbow.id, dagger.id, shortsword.id])
  })

  it('excludes weapons already owned, including magical copies', () => {
    const result = resolveMonsterEquipmentWeaponRecommendations({
      weaponProficiencyItemIds: [dagger.id, shortsword.id],
      referenceEquipment,
      equipmentEntries: [
        {
          entryId: 'magical-dagger',
          equipmentId: dagger.id,
          quantity: 1,
          equipped: false,
          magical: true,
        },
      ],
      rulesetId,
    })
    expect(result).toEqual([{ equipmentId: shortsword.id, label: shortsword.name }])
  })

  it('excludes missing and unresolved references', () => {
    const result = resolveMonsterEquipmentWeaponRecommendations({
      weaponProficiencyItemIds: [dagger.id, 'removed-from-catalog', 'not-a-weapon-slug'],
      referenceEquipment: [dagger],
      equipmentEntries: [],
      rulesetId,
    })
    expect(result).toEqual([{ equipmentId: dagger.id, label: dagger.name }])
  })
})
