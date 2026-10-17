import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../content/equipment'
import { softRecommendationFacts } from '../character-builder/recommendation/resolve-option-presentation-facts'
import { compareEquipmentPickerItemsByRecommendation } from '../character-builder/resolvers/picker/equipment-picker-item'
import type { EquipmentPickerItem } from '../character-builder/resolvers/picker/equipment-picker-item'

import {
  MATCHES_EQUIPPED_WEAPON_LABEL,
  MATCHES_OWNED_WEAPON_LABEL,
  MATCHES_WEAPON_PROFICIENCY_LABEL,
  resolveWeaponCrossRecommendation,
} from './weapon-cross-recommendation'

const longsword = {
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Longsword',
  kind: 'weapon',
  category: 'martial',
} as Extract<Equipment, { kind: 'weapon' }>

const dagger = {
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Dagger',
  kind: 'weapon',
  category: 'simple',
} as Extract<Equipment, { kind: 'weapon' }>

const armor = {
  id: 'srd-cc-5.2.1:leather',
  slug: 'leather',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Leather',
  kind: 'armor',
} as Equipment

function item(
  equipment: Equipment,
  strength: 'strong' | 'compatible' | 'neutral',
): EquipmentPickerItem {
  return {
    equipment,
    state: {
      isAvailable: true,
      isRecommended: strength === 'strong',
      isProficient: true,
      isWithinRemainingBudget: true,
      purchaseAvailability: { status: 'available' },
      recommendation: {
        tier:
          strength === 'strong' ? 'strong' : strength === 'compatible' ? 'compatible' : 'neutral',
        reasons: strength === 'compatible' ? ['selectedWeaponProficiency'] : [],
        specificity: 'exact',
      },
      disabledReasons: [],
      resolved: {
        requirements: [],
        recommendation: {
          strength,
          signals:
            strength === 'neutral'
              ? []
              : [
                  {
                    strength: strength === 'strong' ? 'strong' : 'compatible',
                    basis: 'inferred',
                    specificity: 'exact',
                    reason: strength === 'strong' ? 'classSuggested' : 'selectedWeaponProficiency',
                  },
                ],
        },
        state: {},
      },
    },
  }
}

describe('resolveWeaponCrossRecommendation', () => {
  it('matches an unowned weapon that has a specific proficiency', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [{ weaponId: 'longsword' }],
        inventory: [],
      }),
    ).toEqual({ kind: 'equipment_match', specificity: 'exact' })
  })

  it('prefers the exact match when a category also covers the weapon', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [{ weaponId: longsword.id }, { weaponCategory: 'martial' }],
        inventory: [],
      }),
    ).toEqual({ kind: 'equipment_match', specificity: 'exact' })
  })

  it('does not emit an equipment match for category coverage alone', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [{ weaponCategory: 'martial' }],
        inventory: [],
      }),
    ).toBeNull()
  })

  it('does not recommend a missing proficiency when a category already covers the owned weapon', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [{ weaponCategory: 'martial' }],
        inventory: [{ equipmentId: longsword.id, quantity: 1, equipped: true }],
      }),
    ).toBeNull()
  })

  it('treats mastery as coverage', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [{ weaponId: longsword.id }],
        inventory: [{ equipmentId: longsword.slug, quantity: 1 }],
      }),
    ).toBeNull()
  })

  it('recommends an equipped weapon ahead of an owned one as possession', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [],
        inventory: [{ equipmentId: longsword.id, quantity: 2, equipped: true }],
      }),
    ).toEqual({ kind: 'missing_proficiency', possession: 'equipped' })
    expect(
      resolveWeaponCrossRecommendation({
        equipment: dagger,
        targets: [],
        inventory: [{ equipmentId: dagger.id, quantity: 1, equipped: false }],
      }),
    ).toEqual({ kind: 'missing_proficiency', possession: 'owned' })
  })

  it('ignores a zero quantity and non-weapons', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: longsword,
        targets: [{ weaponId: longsword.id }],
        inventory: [{ equipmentId: longsword.id, quantity: 0, equipped: true }],
      }),
    ).toEqual({ kind: 'equipment_match', specificity: 'exact' })
    expect(
      resolveWeaponCrossRecommendation({
        equipment: armor,
        targets: [{ weaponId: 'leather' }],
        inventory: [{ equipmentId: armor.id, quantity: 1 }],
      }),
    ).toBeNull()
  })

  it('counts a magical copy of the same id as owned', () => {
    expect(
      resolveWeaponCrossRecommendation({
        equipment: dagger,
        targets: [{ weaponId: dagger.id }],
        inventory: [{ equipmentId: dagger.id, quantity: 1 }],
      }),
    ).toBeNull()
  })
})

describe('weapon match presentation and rank', () => {
  it('renders the exact equipment match label and not a category sentence', () => {
    const facts = softRecommendationFacts({
      recommendation: {
        strength: 'compatible',
        signals: [
          {
            strength: 'compatible',
            basis: 'inferred',
            specificity: 'exact',
            reason: 'selectedWeaponProficiency',
          },
        ],
      },
    })
    expect(facts.map((fact) => fact.label)).toEqual([MATCHES_WEAPON_PROFICIENCY_LABEL])
  })

  it('renders equipped and owned proficiency labels', () => {
    expect(MATCHES_EQUIPPED_WEAPON_LABEL).toBe('Matches equipped weapon')
    expect(MATCHES_OWNED_WEAPON_LABEL).toBe('Matches owned weapon')
  })

  it('ranks a class strong signal ahead of an exact weapon match, and a proficient category ahead of other weapons only as a tie-break', () => {
    const strong = item(longsword, 'strong')
    const exact = item({ ...dagger, name: 'Dagger' }, 'compatible')
    expect(compareEquipmentPickerItemsByRecommendation(strong, exact)).toBeLessThan(0)

    const martial = item(longsword, 'neutral')
    const simple = item(dagger, 'neutral')
    expect(
      compareEquipmentPickerItemsByRecommendation(martial, simple, {
        preferMartialWeaponBrowseOrder: false,
        proficientWeaponCategories: ['martial'],
      }),
    ).toBeLessThan(0)
    expect(
      compareEquipmentPickerItemsByRecommendation(martial, simple, {
        preferMartialWeaponBrowseOrder: false,
        proficientWeaponCategories: ['simple', 'martial'],
      }),
    ).toBeLessThan(0)
    expect(
      compareEquipmentPickerItemsByRecommendation(simple, martial, {
        preferMartialWeaponBrowseOrder: false,
        proficientWeaponCategories: [],
      }),
    ).toBeLessThan(0)
  })
})
