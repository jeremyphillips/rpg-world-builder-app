import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
} from './equipment-picker-drawer.fixtures'
import {
  filterEquipmentPickerItems,
  formatEquipmentUnaffordableReason,
  getEquipmentPickerBadgeLabel,
  getEquipmentPickerItemTab,
} from './equipment-picker-drawer.lib'
import {
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
      selectedKinds: ['weapon', 'armor', 'adventuring_gear'],
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope'])
  })

  it('builds unaffordable copy and warning badges', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    expect(formatEquipmentUnaffordableReason(chainMail, equipmentPickerBudgetFixture)).toBe(
      'Need 75 GP, you have 40 GP',
    )
    expect(getEquipmentPickerBadgeLabel(chainMail)).toBe(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)
  })
})
