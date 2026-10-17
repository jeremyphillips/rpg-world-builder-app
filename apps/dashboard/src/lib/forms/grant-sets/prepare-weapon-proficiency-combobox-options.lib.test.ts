import { describe, expect, it } from 'vitest'

import {
  MATCHES_EQUIPPED_WEAPON_LABEL,
  MATCHES_OWNED_WEAPON_LABEL,
  type Equipment,
} from '@rpg/contracts'

import {
  prepareWeaponProficiencyComboboxOptions,
  resolveWeaponProficiencyMissingRecommendations,
} from './prepare-weapon-proficiency-combobox-options.lib'

const dagger = {
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Dagger',
  kind: 'weapon',
  category: 'simple',
} as Extract<Equipment, { kind: 'weapon' }>

const longsword = {
  ...dagger,
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  name: 'Longsword',
  category: 'martial',
} as Extract<Equipment, { kind: 'weapon' }>

const options = [
  { value: dagger.id, label: 'Dagger' },
  { value: longsword.id, label: 'Longsword' },
  { value: 'srd:club', label: 'Club' },
]

describe('prepareWeaponProficiencyComboboxOptions', () => {
  it('orders equipped matches before owned matches and leaves the rest', () => {
    const prepared = prepareWeaponProficiencyComboboxOptions({
      options,
      equipmentCatalog: [dagger, longsword],
      targets: [],
      inventory: [
        { equipmentId: longsword.id, quantity: 1, equipped: false },
        { equipmentId: dagger.id, quantity: 1, equipped: true },
      ],
      selectedIds: new Set(),
    })
    expect(prepared.map((option) => option.value)).toEqual([dagger.id, longsword.id, 'srd:club'])
    expect(prepared[0]?.description).toBe(MATCHES_EQUIPPED_WEAPON_LABEL)
    expect(prepared[1]?.description).toBe(MATCHES_OWNED_WEAPON_LABEL)
    expect(prepared[2]?.description).toBeUndefined()
  })

  it('does not describe a selected grant or a weapon covered by a category', () => {
    const prepared = prepareWeaponProficiencyComboboxOptions({
      options,
      equipmentCatalog: [dagger, longsword],
      targets: [{ weaponCategory: 'martial' }],
      inventory: [
        { equipmentId: dagger.id, quantity: 1, equipped: true },
        { equipmentId: longsword.id, quantity: 1, equipped: true },
      ],
      selectedIds: new Set([dagger.id]),
    })
    expect(prepared.find((option) => option.value === dagger.id)?.description).toBeUndefined()
    expect(prepared.find((option) => option.value === longsword.id)?.description).toBeUndefined()
  })
})

describe('resolveWeaponProficiencyMissingRecommendations', () => {
  it('returns grant ids for owned weapons without proficiency in equipped-first order', () => {
    const recommendations = resolveWeaponProficiencyMissingRecommendations({
      options,
      equipmentCatalog: [dagger, longsword],
      targets: [],
      inventory: [
        { equipmentId: longsword.id, quantity: 1, equipped: false },
        { equipmentId: dagger.id, quantity: 1, equipped: true },
      ],
      selectedIds: new Set(),
    })
    expect(recommendations).toEqual([
      { grantId: dagger.id, label: 'Dagger' },
      { grantId: longsword.id, label: 'Longsword' },
    ])
  })

  it('excludes grants already selected or covered by category proficiency', () => {
    const recommendations = resolveWeaponProficiencyMissingRecommendations({
      options,
      equipmentCatalog: [dagger, longsword],
      targets: [{ weaponCategory: 'martial' }],
      inventory: [
        { equipmentId: dagger.id, quantity: 1, equipped: true },
        { equipmentId: longsword.id, quantity: 1, equipped: true },
      ],
      selectedIds: new Set([dagger.id]),
    })
    expect(recommendations).toEqual([])
  })
})
