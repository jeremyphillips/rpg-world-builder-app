import type { EquipmentPickerItem } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  matchesEquipmentPickerArmorDetailFilters,
  matchesEquipmentPickerWeaponDetailFilters,
} from './equipment-picker-detail-filters.lib'

describe('matchesEquipmentPickerWeaponDetailFilters', () => {
  const martialMelee = {
    equipment: {
      kind: 'weapon',
      category: 'martial',
      mode: 'melee',
      properties: ['heavy', 'two-handed'],
    },
  } as unknown as EquipmentPickerItem

  it('passes when no chip filters are active', () => {
    expect(
      matchesEquipmentPickerWeaponDetailFilters(martialMelee, {
        categories: [],
        modes: [],
        properties: [],
      }),
    ).toBe(true)
  })

  it('requires category, mode, and at least one property when selected', () => {
    expect(
      matchesEquipmentPickerWeaponDetailFilters(martialMelee, {
        categories: ['martial'],
        modes: ['melee'],
        properties: ['heavy'],
      }),
    ).toBe(true)
    expect(
      matchesEquipmentPickerWeaponDetailFilters(martialMelee, {
        categories: ['simple'],
        modes: [],
        properties: [],
      }),
    ).toBe(false)
    expect(
      matchesEquipmentPickerWeaponDetailFilters(martialMelee, {
        categories: [],
        modes: [],
        properties: ['finesse'],
      }),
    ).toBe(false)
  })
})

describe('matchesEquipmentPickerArmorDetailFilters', () => {
  const lightNoStealthPenalty = {
    equipment: { kind: 'armor', category: 'light', stealthDisadvantage: false },
    state: { resolved: { state: { compatibility: {} } } },
  } as unknown as EquipmentPickerItem

  const heavyStealthPenalty = {
    equipment: { kind: 'armor', category: 'heavy', stealthDisadvantage: true },
    state: { resolved: { state: { compatibility: {} } } },
  } as unknown as EquipmentPickerItem

  it('maps no-stealth-disadvantage to grant dimension stealth none', () => {
    expect(
      matchesEquipmentPickerArmorDetailFilters(lightNoStealthPenalty, {
        categories: [],
        stealth: ['no-stealth-disadvantage'],
        strength: [],
      }),
    ).toBe(true)
    expect(
      matchesEquipmentPickerArmorDetailFilters(heavyStealthPenalty, {
        categories: [],
        stealth: ['no-stealth-disadvantage'],
        strength: [],
      }),
    ).toBe(false)
  })

  it('hides armor with unmet strength when hide-unmet-strength is selected', () => {
    const unmet = {
      equipment: { kind: 'armor', category: 'heavy', stealthDisadvantage: true },
      state: {
        resolved: {
          state: { compatibility: { unmetAbilityScoreRequirements: [{ ability: 'str' }] } },
        },
      },
    } as unknown as EquipmentPickerItem

    expect(
      matchesEquipmentPickerArmorDetailFilters(unmet, {
        categories: [],
        stealth: [],
        strength: ['hide-unmet-strength'],
      }),
    ).toBe(false)
    expect(
      matchesEquipmentPickerArmorDetailFilters(lightNoStealthPenalty, {
        categories: [],
        stealth: [],
        strength: ['hide-unmet-strength'],
      }),
    ).toBe(true)
  })
})
