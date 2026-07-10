import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
  equipmentPickerRopeFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
} from './equipment-picker-drawer.fixtures'
import {
  filterEquipmentPickerItems,
  formatEquipmentUnaffordableReason,
  getEquipmentPickerBadge,
  getEquipmentPickerDisabledNote,
  getEquipmentPickerItemTab,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
  sortEquipmentPickerItems,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'

describe('equipment-picker-drawer.lib', () => {
  it('routes essential/strong tiers to the recommended tab and the rest to all', () => {
    expect(getEquipmentPickerItemTab(equipmentPickerItemsFixture[0]!)).toBe(
      EQUIPMENT_PICKER_TAB_RECOMMENDED,
    )
    expect(getEquipmentPickerItemTab(equipmentPickerItemsFixture[1]!)).toBe(
      EQUIPMENT_PICKER_TAB_ALL,
    )
    expect(getEquipmentPickerItemTab(equipmentPickerItemsFixture[2]!)).toBe(
      EQUIPMENT_PICKER_TAB_ALL,
    )
  })

  it('sorts items by recommendation tier with not-proficient gear last', () => {
    const sorted = sortEquipmentPickerItems([
      equipmentPickerItemsFixture[1]!,
      equipmentPickerItemsFixture[2]!,
      equipmentPickerItemsFixture[0]!,
    ])

    expect(sorted.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope', 'Chain Mail'])
  })

  it('sorts compatible proficient items above neutral in All without Recommended-tab membership', () => {
    const neutralRope = equipmentPickerItemsFixture[2]!
    const compatibleRope: EquipmentPickerItem = {
      ...neutralRope,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:silk-rope',
        slug: 'silk-rope',
        name: 'Silk Rope',
      },
      searchText: 'silk rope adventuring gear',
      state: {
        ...neutralRope.state,
        isRecommended: false,
        recommendation: { tier: 'compatible', reasons: ['proficient'] },
      },
    }

    const sorted = sortEquipmentPickerItems([neutralRope, compatibleRope])
    expect(sorted.map((item) => item.equipment.name)).toEqual(['Silk Rope', 'Rope'])
    expect(getEquipmentPickerItemTab(compatibleRope)).toBe(EQUIPMENT_PICKER_TAB_ALL)
    expect(compatibleRope.state.isRecommended).toBe(false)
  })

  it('filters starting-unaffordable and non-proficient rows', () => {
    const startingUnaffordable: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[1]!,
      equipment: {
        ...equipmentPickerItemsFixture[1]!.equipment,
        id: 'srd-cc-5.2.1:plate-armor',
        slug: 'plate-armor',
        name: 'Plate Armor',
        cost: { amount: 1500, currency: 'gp' },
      },
      state: {
        ...equipmentPickerItemsFixture[1]!.state,
        isAffordable: false,
        isWithinRemainingBudget: false,
        isProficient: true,
      },
    }

    const filtered = filterEquipmentPickerItems(
      [equipmentPickerItemsFixture[0]!, startingUnaffordable, equipmentPickerItemsFixture[2]!],
      {
        filterOutUnaffordable: true,
        filterOutNonProficient: true,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
      },
    )

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope'])
  })

  it('keeps remaining-unaffordable rows visible but disables purchase', () => {
    const chainMail = equipmentPickerItemsFixture[1]!

    expect(
      filterEquipmentPickerItems([chainMail], {
        filterOutUnaffordable: true,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
      }),
    ).toHaveLength(1)
    expect(isEquipmentPickerItemDisabled(chainMail)).toBe(true)
    expect(getEquipmentPickerDisabledNote(chainMail, equipmentPickerBudgetFixture)).toBe(
      'Need 75 GP, you have 40 GP',
    )
  })

  it('shows starting-unaffordable rows with filter off but keeps purchase disabled', () => {
    const startingUnaffordable: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[1]!,
      equipment: {
        ...equipmentPickerItemsFixture[1]!.equipment,
        id: 'srd-cc-5.2.1:plate-armor',
        slug: 'plate-armor',
        name: 'Plate Armor',
        cost: { amount: 1500, currency: 'gp' },
      },
      state: {
        ...equipmentPickerItemsFixture[1]!.state,
        isAffordable: false,
        isWithinRemainingBudget: false,
        isProficient: true,
      },
    }

    expect(
      filterEquipmentPickerItems([startingUnaffordable], {
        filterOutUnaffordable: false,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
      }),
    ).toHaveLength(1)
    expect(isEquipmentPickerItemDisabled(startingUnaffordable)).toBe(true)
  })

  it('prefers structural disabled reasons over remaining-budget notes', () => {
    const restricted: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[1]!,
      state: {
        ...equipmentPickerItemsFixture[1]!.state,
        disabledReasons: ['Already selected'],
      },
    }

    expect(getEquipmentPickerDisabledNote(restricted, equipmentPickerBudgetFixture)).toBe(
      'Already selected',
    )
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
    expect(getEquipmentPickerBadge(chainMail)).toEqual({
      label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
      emphasis: 'warning',
    })
  })

  it('badges recommendation tiers sparsely', () => {
    const longsword = equipmentPickerItemsFixture[0]!
    expect(getEquipmentPickerBadge(longsword)).toEqual({
      label: EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
      emphasis: 'highlight',
    })

    const rope = equipmentPickerItemsFixture[2]!
    expect(getEquipmentPickerBadge(rope)).toBeUndefined()

    const essentialTool = {
      ...longsword,
      state: {
        ...longsword.state,
        recommendation: { tier: 'essential' as const, reasons: ['classToolNeed' as const] },
      },
    }
    expect(getEquipmentPickerBadge(essentialTool)?.label).toBe('Class tool')

    const essentialRule = {
      ...longsword,
      state: {
        ...longsword.state,
        recommendation: { tier: 'essential' as const, reasons: ['classRequired' as const] },
      },
    }
    expect(getEquipmentPickerBadge(essentialRule)?.label).toBe(EQUIPMENT_PICKER_ESSENTIAL_LABEL)

    const labeledRule = {
      ...longsword,
      state: {
        ...longsword.state,
        recommendation: {
          tier: 'essential' as const,
          reasons: ['classRequired' as const],
          label: 'Spellbook',
        },
      },
    }
    expect(getEquipmentPickerBadge(labeledRule)?.label).toBe('Spellbook')
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
          isWithinRemainingBudget: true,
          recommendation: { tier: 'neutral' as const, reasons: [] },
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
          isWithinRemainingBudget: true,
          recommendation: { tier: 'neutral' as const, reasons: [] },
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
