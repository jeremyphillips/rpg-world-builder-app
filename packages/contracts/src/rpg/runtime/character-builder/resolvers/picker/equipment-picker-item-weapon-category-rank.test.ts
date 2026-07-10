import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../../../content/equipment'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import {
  characterPrefersMartialWeaponBrowseOrder,
  getEquipmentWeaponCategoryBrowseRank,
} from './equipment-picker-item-weapon-category-rank'

const dagger = {
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Dagger',
  kind: 'weapon',
  category: 'simple',
} as Extract<Equipment, { kind: 'weapon' }>

const battleaxe = {
  id: 'srd-cc-5.2.1:battleaxe',
  slug: 'battleaxe',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Battleaxe',
  kind: 'weapon',
  category: 'martial',
} as Extract<Equipment, { kind: 'weapon' }>

const emptyProficiencies = {
  skills: [],
  weapons: [],
  armor: [],
  tools: [],
  languages: [],
} satisfies CharacterProficiencies

describe('characterPrefersMartialWeaponBrowseOrder', () => {
  it('is true when both simple and martial categories are proficient', () => {
    expect(
      characterPrefersMartialWeaponBrowseOrder({
        ...emptyProficiencies,
        weapons: [
          { weaponCategory: 'simple', rank: 'proficient', sources: [] },
          { weaponCategory: 'martial', rank: 'proficient', sources: [] },
        ],
      }),
    ).toBe(true)
  })

  it('is false when only one weapon category is proficient', () => {
    expect(
      characterPrefersMartialWeaponBrowseOrder({
        ...emptyProficiencies,
        weapons: [{ weaponCategory: 'simple', rank: 'proficient', sources: [] }],
      }),
    ).toBe(false)
  })
})

describe('getEquipmentWeaponCategoryBrowseRank', () => {
  it('ranks martial before simple when preference is enabled', () => {
    expect(getEquipmentWeaponCategoryBrowseRank(battleaxe, true)).toBeLessThan(
      getEquipmentWeaponCategoryBrowseRank(dagger, true),
    )
  })

  it('returns neutral ranks when preference is disabled', () => {
    expect(getEquipmentWeaponCategoryBrowseRank(battleaxe, false)).toBe(0)
    expect(getEquipmentWeaponCategoryBrowseRank(dagger, false)).toBe(0)
  })
})
