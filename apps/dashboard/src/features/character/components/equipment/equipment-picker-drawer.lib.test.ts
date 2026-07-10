import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
} from './equipment-picker-drawer.fixtures'
import {
  filterEquipmentPickerItems,
  formatEquipmentUnaffordableReason,
  getEquipmentPickerBadgeLabel,
  getEquipmentPickerItemTab,
  resolveEquipmentKindFilterOptions,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
} from './equipment-picker-drawer.types'

describe('equipment-picker-drawer.lib', () => {
  it('routes recommended items to the recommended tab', () => {
    expect(getEquipmentPickerItemTab(equipmentPickerItemsFixture[0]!)).toBe(
      EQUIPMENT_PICKER_TAB_RECOMMENDED,
    )
  })

  it('filters unaffordable and non-proficient rows', () => {
    const filtered = filterEquipmentPickerItems(equipmentPickerItemsFixture, {
      filterOutUnaffordable: true,
      filterOutNonProficient: true,
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope'])
  })

  it('filters rows by selected kind', () => {
    const filtered = filterEquipmentPickerItems(equipmentPickerItemsFixture, {
      filterOutUnaffordable: false,
      filterOutNonProficient: false,
      selectedKind: 'weapon',
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword'])
  })

  it('builds unaffordable copy and warning badges', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    expect(formatEquipmentUnaffordableReason(chainMail, equipmentPickerBudgetFixture)).toBe(
      'Need 75 GP, you have 40 GP',
    )
    expect(getEquipmentPickerBadgeLabel(chainMail)).toBe(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)
  })

  it('excludes vehicle and service kinds from category filter and results', () => {
    const items = [
      ...equipmentPickerItemsFixture,
      {
        equipment: equipmentPickerRowboatFixture,
        searchText: 'rowboat water vehicle',
        state: {
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          disabledReasons: [],
        },
      },
      {
        equipment: equipmentPickerSkilledHirelingFixture,
        searchText: 'skilled hireling service',
        state: {
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          disabledReasons: [],
        },
      },
    ]

    expect(resolveEquipmentKindFilterOptions(items)).toEqual([
      'weapon',
      'armor',
      'adventuring_gear',
    ])

    const filtered = filterEquipmentPickerItems(items, {
      filterOutUnaffordable: false,
      filterOutNonProficient: false,
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Chain Mail', 'Rope'])
  })
})
