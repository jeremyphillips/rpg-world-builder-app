import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerPotionFixture,
  equipmentPickerRopeFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
  pickerState,
} from './equipment-picker-drawer.fixtures'
import {
  countEquipmentPickerAffordableHiddenImpact,
  countEquipmentPickerClearableCriteria,
  countEquipmentPickerStructuredFilters,
  filterAndSortEquipmentPickerItems,
  filterEquipmentPickerItems,
  formatEquipmentUnaffordableReason,
  getEquipmentPickerDisabledNote,
  getEquipmentUnaffordableAmounts,
  hasEquipmentPickerClearableCriteria,
  hasEquipmentPickerResetViewCriteria,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
  sortEquipmentPickerItems,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'

describe('equipment-picker-drawer.lib', () => {
  it('sorts items by recommendation tier with not-proficient gear last', () => {
    const sorted = sortEquipmentPickerItems([
      equipmentPickerItemsFixture[1]!,
      equipmentPickerItemsFixture[2]!,
      equipmentPickerItemsFixture[0]!,
    ])

    expect(sorted.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope', 'Chain Mail'])
  })

  it('sorts compatible proficient items above neutral peers in a unified list', () => {
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
        recommendation: { tier: 'compatible', reasons: ['proficient'], specificity: 'exact' },
      },
    }

    const sorted = sortEquipmentPickerItems([neutralRope, compatibleRope])
    expect(sorted.map((item) => item.equipment.name)).toEqual(['Silk Rope', 'Rope'])
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
      '75 GP needed · 40 GP remaining',
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

  it('formats unaffordable copy for disabled notes', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    expect(formatEquipmentUnaffordableReason(chainMail, equipmentPickerBudgetFixture)).toBe(
      '75 GP needed · 40 GP remaining',
    )
  })

  it('excludes vehicle and service kinds from category filter and results', () => {
    const items = [
      ...equipmentPickerItemsFixture,
      {
        equipment: equipmentPickerRowboatFixture,
        searchText: 'rowboat water vehicle',
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
          disabledReasons: [],
        }),
      },
      {
        equipment: equipmentPickerSkilledHirelingFixture,
        searchText: 'skilled hireling service',
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
          disabledReasons: [],
        }),
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

  it('keeps unpriced rows visible when filterOutUnaffordable is enabled', () => {
    const unpricedMagicItem: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[0]!,
      equipment: {
        ...equipmentPickerItemsFixture[0]!.equipment,
        id: 'srd-cc-5.2.1:amulet-of-health',
        slug: 'amulet-of-health',
        name: 'Amulet of Health',
        kind: 'magic_item',
        rarity: 'rare',
        magicItemCategory: 'wondrous_item',
        cost: null,
      },
      state: {
        ...equipmentPickerItemsFixture[0]!.state,
        isAffordable: false,
        isWithinRemainingBudget: false,
        purchaseAvailability: { status: 'unavailable', reason: 'no_market_price' },
      },
    }

    const filtered = filterEquipmentPickerItems([unpricedMagicItem], {
      filterOutUnaffordable: true,
      filterOutNonProficient: false,
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
    })

    expect(filtered).toHaveLength(1)
    expect(isEquipmentPickerItemDisabled(unpricedMagicItem)).toBe(true)
    expect(getEquipmentPickerDisabledNote(unpricedMagicItem)).toBe('Not for sale')
  })

  it('filters remaining-unaffordable rows when showAffordableOnly is on', () => {
    const filtered = filterEquipmentPickerItems(equipmentPickerItemsFixture, {
      filterOutUnaffordable: false,
      filterOutNonProficient: false,
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
      showAffordableOnly: true,
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope'])
  })

  it('counts structured filters separately from clearable criteria', () => {
    expect(
      countEquipmentPickerStructuredFilters({
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
      }),
    ).toBe(0)
    expect(
      countEquipmentPickerStructuredFilters({
        selectedKind: 'weapon',
        showAffordableOnly: true,
      }),
    ).toBe(2)
    expect(
      countEquipmentPickerClearableCriteria({
        selectedKind: 'weapon',
        showAffordableOnly: true,
        searchQuery: 'rope',
      }),
    ).toBe(3)
    expect(hasEquipmentPickerClearableCriteria(0)).toBe(false)
    expect(hasEquipmentPickerClearableCriteria(1)).toBe(true)
  })

  it('returns domain amounts for remaining-budget failures', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    expect(getEquipmentUnaffordableAmounts(chainMail, equipmentPickerBudgetFixture)).toEqual({
      required: chainMail.equipment.cost,
      remaining: equipmentPickerBudgetFixture.remaining,
    })
    expect(getEquipmentUnaffordableAmounts(chainMail)).toBeUndefined()
    expect(
      getEquipmentUnaffordableAmounts(
        equipmentPickerItemsFixture[0]!,
        equipmentPickerBudgetFixture,
      ),
    ).toBeUndefined()
  })

  it('keeps strong, neutral, and blocked magic rows in one unified best_match list', () => {
    const longsword = equipmentPickerItemsFixture[0]!
    const rope = equipmentPickerItemsFixture[2]!
    const blockedMagic: EquipmentPickerItem = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:bead-of-force',
        slug: 'bead-of-force',
        name: 'Bead of Force',
      },
      searchText: 'bead of force magic item',
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isAffordable: true,
        isWithinRemainingBudget: true,
        recommendation: {
          tier: 'notRecommended',
          reasons: ['notProficient'],
          specificity: 'exact',
        },
        disabledReasons: ['Unavailable'],
        magicItemAction: { rank: 3, reason: 'unavailable' },
      }),
    }

    const shuffled = [blockedMagic, rope, longsword]

    expect(
      filterAndSortEquipmentPickerItems(shuffled, {
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
      }).map((item) => item.equipment.name),
    ).toEqual(['Longsword', 'Rope', 'Bead of Force'])

    expect(
      filterAndSortEquipmentPickerItems(shuffled, {
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_NAME_ASC,
      }).map((item) => item.equipment.name),
    ).toEqual(['Bead of Force', 'Longsword', 'Rope'])
  })

  it('lets search beat magic-item action rank for blocked rows in magic-items workflow', () => {
    const bead: EquipmentPickerItem = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:bead-of-force',
        slug: 'bead-of-force',
        name: 'Bead of Force',
      },
      searchText: 'bead of force magic item',
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isAffordable: true,
        isWithinRemainingBudget: true,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        disabledReasons: [],
        magicItemAction: { rank: 3, reason: 'unavailable' },
      }),
    }
    const otherMagic: EquipmentPickerItem = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:other-relic',
        slug: 'other-relic',
        name: 'Other Relic',
      },
      searchText: 'other relic magic item',
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isAffordable: true,
        isWithinRemainingBudget: true,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        disabledReasons: [],
        magicItemAction: { rank: 0, reason: 'grant_available' },
      }),
    }

    expect(
      filterAndSortEquipmentPickerItems([otherMagic, bead], {
        searchQuery: 'bead',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
        workflowMode: 'magic_items',
      }).map((item) => item.equipment.name),
    ).toEqual(['Bead of Force'])
  })

  it('orders magic-items workflow by action rank before recommendation', () => {
    const grantAvailable: EquipmentPickerItem = {
      equipment: equipmentPickerPotionFixture,
      searchText: 'potion of healing magic item',
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isAffordable: true,
        isWithinRemainingBudget: true,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        disabledReasons: [],
        magicItemAction: { rank: 0, reason: 'grant_available' },
      }),
    }
    const unavailableStrong: EquipmentPickerItem = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:strong-relic',
        slug: 'strong-relic',
        name: 'Strong Relic',
      },
      searchText: 'strong relic magic item',
      state: pickerState({
        isAvailable: true,
        isRecommended: true,
        isProficient: true,
        isAffordable: true,
        isWithinRemainingBudget: true,
        recommendation: {
          tier: 'strong',
          reasons: ['startingEquipment'],
          specificity: 'exact',
        },
        disabledReasons: [],
        magicItemAction: { rank: 3, reason: 'unavailable' },
      }),
    }

    expect(
      filterAndSortEquipmentPickerItems([unavailableStrong, grantAvailable], {
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
        workflowMode: 'magic_items',
      }).map((item) => item.equipment.name),
    ).toEqual(['Potion of Healing', 'Strong Relic'])
  })

  it('matches recommendation order for empty-query best_match', () => {
    const shuffled = [
      equipmentPickerItemsFixture[1]!,
      equipmentPickerItemsFixture[2]!,
      equipmentPickerItemsFixture[0]!,
    ]

    expect(
      filterAndSortEquipmentPickerItems(shuffled, {
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
      }).map((item) => item.equipment.name),
    ).toEqual(sortEquipmentPickerItems(shuffled).map((item) => item.equipment.name))
  })

  it('sorts by price ascending with best-match tiebreaker for equal prices', () => {
    const cheapRope: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[2]!,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:cheap-rope',
        slug: 'cheap-rope',
        name: 'Cheap Rope',
        cost: { amount: 1, currency: 'gp' },
      },
      searchText: 'cheap rope adventuring gear',
    }
    const priceyRope: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[2]!,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:pricey-rope',
        slug: 'pricey-rope',
        name: 'Pricey Rope',
        cost: { amount: 5, currency: 'gp' },
      },
      searchText: 'pricey rope adventuring gear',
    }

    const sorted = filterAndSortEquipmentPickerItems([priceyRope, cheapRope], {
      searchQuery: '',
      sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
    })

    expect(sorted.map((item) => item.equipment.name)).toEqual(['Cheap Rope', 'Pricey Rope'])
  })

  it('sorts priceless items after priced rows in both price directions', () => {
    const priced = equipmentPickerItemsFixture[2]!
    const priceless: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[2]!,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:priceless-rope',
        slug: 'priceless-rope',
        name: 'Priceless Rope',
        cost: null,
      },
      searchText: 'priceless rope adventuring gear',
    }

    const asc = filterAndSortEquipmentPickerItems([priceless, priced], {
      searchQuery: '',
      sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
    })
    const desc = filterAndSortEquipmentPickerItems([priceless, priced], {
      searchQuery: '',
      sortMode: 'price_desc',
    })

    expect(asc.map((item) => item.equipment.name)).toEqual(['Rope', 'Priceless Rope'])
    expect(desc.map((item) => item.equipment.name)).toEqual(['Rope', 'Priceless Rope'])
  })

  it('excludes search score-zero rows and lets price sort beat relevance with a query', () => {
    const longsword = equipmentPickerItemsFixture[0]!
    const chainMail = equipmentPickerItemsFixture[1]!
    const rope = equipmentPickerItemsFixture[2]!

    const filtered = filterAndSortEquipmentPickerItems([longsword, chainMail, rope], {
      searchQuery: 'rope',
      sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
    })
    expect(filtered.map((item) => item.equipment.name)).toEqual(['Rope'])

    const priceSorted = filterAndSortEquipmentPickerItems([longsword, rope], {
      searchQuery: 'long',
      sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
    })
    expect(priceSorted.map((item) => item.equipment.name)).toEqual(['Longsword'])
  })

  it('detects reset-view criteria including sort drift', () => {
    expect(
      hasEquipmentPickerResetViewCriteria({
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
      }),
    ).toBe(true)
    expect(
      hasEquipmentPickerResetViewCriteria({
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
      }),
    ).toBe(false)
  })

  it('counts affordable hidden impact after search and structured filters', () => {
    expect(
      countEquipmentPickerAffordableHiddenImpact(equipmentPickerDefaultPathItemsFixture, {
        searchQuery: '',
        filterOutUnaffordable: true,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: true,
      }),
    ).toBe(1)

    expect(
      countEquipmentPickerAffordableHiddenImpact(equipmentPickerDefaultPathItemsFixture, {
        searchQuery: 'cheap',
        filterOutUnaffordable: true,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: true,
      }),
    ).toBe(0)
  })

  it('hides affordable impact count when the toggle is off or nothing is excluded', () => {
    expect(
      countEquipmentPickerAffordableHiddenImpact(equipmentPickerDefaultPathItemsFixture, {
        searchQuery: '',
        filterOutUnaffordable: true,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
      }),
    ).toBe(0)
  })
})
