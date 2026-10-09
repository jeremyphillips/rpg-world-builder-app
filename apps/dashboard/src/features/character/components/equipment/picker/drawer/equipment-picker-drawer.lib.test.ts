import { describe, expect, it } from 'vitest'

import { moneyToCopper, wealthToCopper } from '@rpg/contracts'

import { EMPTY_EQUIPMENT_OWNERSHIP } from '../../../../lib/equipment/equipment-ownership-index.lib'

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
  countEquipmentPickerStructuredFilters,
  filterAndSortEquipmentPickerItems,
  filterEquipmentPickerItems,
  formatEquipmentUnaffordableReason,
  getEquipmentUnaffordableAmounts,
  hasEquipmentPickerResetViewCriteria,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
  resolveEquipmentPickerDrawerItemHeaderPresentation,
  resolveMaxPurchaseAggregate,
  sortEquipmentPickerItems,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  type EquipmentPickerRow,
} from './equipment-picker-drawer.types'

function pickerSearchDocument(id: string, text: string) {
  return { id, fields: [{ key: 'combined', text, role: 'primary' as const }] }
}

describe('equipment-picker-drawer.lib', () => {
  it('sorts items by resolved facts and canonical kind', () => {
    const sorted = sortEquipmentPickerItems([
      equipmentPickerItemsFixture[1]!,
      equipmentPickerItemsFixture[2]!,
      equipmentPickerItemsFixture[0]!,
    ])

    expect(sorted.map((item) => item.equipment.name)).toEqual(['Longsword', 'Chain Mail', 'Rope'])
  })

  it('sorts compatible proficient items above neutral peers in a unified list', () => {
    const neutralRope = equipmentPickerItemsFixture[2]!
    const compatibleRope: EquipmentPickerRow = {
      ...neutralRope,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:silk-rope',
        slug: 'silk-rope',
        name: 'Silk Rope',
      },
      searchDocument: pickerSearchDocument('srd-cc-5.2.1:silk-rope', 'silk rope adventuring gear'),
      state: {
        ...neutralRope.state,
        isRecommended: false,
        recommendation: { tier: 'compatible', reasons: ['classSuggested'], specificity: 'exact' },
        resolved: {
          requirements: [],
          recommendation: {
            strength: 'compatible',
            signals: [
              {
                strength: 'compatible',
                basis: 'inferred',
                specificity: 'exact',
              },
            ],
          },
          state: {},
        },
      },
    }

    const sorted = sortEquipmentPickerItems([neutralRope, compatibleRope])
    expect(sorted.map((item) => item.equipment.name)).toEqual(['Silk Rope', 'Rope'])
    expect(compatibleRope.state.isRecommended).toBe(false)
  })

  it('filters starting-unaffordable and non-proficient rows', () => {
    const startingUnaffordable: EquipmentPickerRow = {
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
        isWithinRemainingBudget: false,
        isProficient: true,
      },
    }

    const filtered = filterEquipmentPickerItems(
      [equipmentPickerItemsFixture[0]!, startingUnaffordable, equipmentPickerItemsFixture[2]!],
      {
        filterOutUnaffordable: true,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        budget: equipmentPickerBudgetFixture,
      },
    )

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope'])
  })

  it('keeps disabled add on unaffordable purchase fallbacks', () => {
    const unaffordable = equipmentPickerDefaultPathItemsFixture[1]!

    expect(
      resolveEquipmentPickerDrawerItemHeaderPresentation({
        item: unaffordable,
        workflowMode: 'purchase',
        ownership: EMPTY_EQUIPMENT_OWNERSHIP,
      }).control,
    ).toEqual({ kind: 'add', disabled: true })
  })

  it('pins the stepper ceiling to what the remaining purse covers', () => {
    const longsword = equipmentPickerItemsFixture[0]!
    const ownership = {
      ...EMPTY_EQUIPMENT_OWNERSHIP,
      editablePurchased: { quantity: 1, spendCp: 1500 },
      totalQuantity: 1,
      acquiredQuantity: 1,
    }

    expect(
      resolveMaxPurchaseAggregate({
        equipment: longsword.equipment,
        ownership,
        budget: equipmentPickerBudgetFixture,
      }),
    ).toBe(
      1 +
        Math.floor(
          wealthToCopper(equipmentPickerBudgetFixture.remaining) /
            moneyToCopper(longsword.equipment.cost!),
        ),
    )
  })

  it('keeps remaining-unaffordable rows visible but disables purchase', () => {
    const chainMail = equipmentPickerItemsFixture[1]!

    expect(
      filterEquipmentPickerItems([chainMail], {
        filterOutUnaffordable: true,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        budget: equipmentPickerBudgetFixture,
      }),
    ).toHaveLength(1)
    expect(isEquipmentPickerItemDisabled(chainMail)).toBe(true)
    expect(formatEquipmentUnaffordableReason(chainMail, equipmentPickerBudgetFixture)).toBe(
      '75 GP needed · 40 GP remaining',
    )
  })

  it('shows starting-unaffordable rows with filter off but keeps purchase disabled', () => {
    const startingUnaffordable: EquipmentPickerRow = {
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
        isWithinRemainingBudget: false,
        isProficient: true,
      },
    }

    expect(
      filterEquipmentPickerItems([startingUnaffordable], {
        filterOutUnaffordable: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
      }),
    ).toHaveLength(1)
    expect(isEquipmentPickerItemDisabled(startingUnaffordable)).toBe(true)
  })

  it('filters rows by selected kind', () => {
    const filtered = filterEquipmentPickerItems(equipmentPickerItemsFixture, {
      filterOutUnaffordable: false,
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

  it('keeps silver and copper in the unaffordable remaining half', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    expect(
      formatEquipmentUnaffordableReason(chainMail, {
        ...equipmentPickerBudgetFixture,
        remaining: { cp: 0, sp: 6, gp: 74, pp: 0 },
      }),
    ).toBe('75 GP needed · 74 GP 6 SP remaining')
  })

  it('excludes vehicle and service kinds from category filter and results', () => {
    const items = [
      ...equipmentPickerItemsFixture,
      {
        equipment: equipmentPickerRowboatFixture,
        searchDocument: pickerSearchDocument(
          equipmentPickerRowboatFixture.id,
          'rowboat water vehicle',
        ),
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
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
        searchDocument: pickerSearchDocument(
          equipmentPickerSkilledHirelingFixture.id,
          'skilled hireling service',
        ),
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
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
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Chain Mail', 'Rope'])
  })

  it('keeps unpriced rows visible when filterOutUnaffordable is enabled', () => {
    const unpricedMagicItem: EquipmentPickerRow = {
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
        isWithinRemainingBudget: false,
        purchaseAvailability: { status: 'unavailableForPurchase', reason: 'no_market_price' },
      },
    }

    const filtered = filterEquipmentPickerItems([unpricedMagicItem], {
      filterOutUnaffordable: true,
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
    })

    expect(filtered).toHaveLength(1)
    expect(isEquipmentPickerItemDisabled(unpricedMagicItem)).toBe(true)
  })

  it('filters remaining-unaffordable rows when showAffordableOnly is on', () => {
    const filtered = filterEquipmentPickerItems(equipmentPickerItemsFixture, {
      filterOutUnaffordable: false,
      selectedKind: EQUIPMENT_PICKER_KIND_ALL,
      showAffordableOnly: true,
    })

    expect(filtered.map((item) => item.equipment.name)).toEqual(['Longsword', 'Rope'])
  })

  it('counts structured filters', () => {
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
  })

  it('counts magic-item rarity focus as a structured filter in magic-items workflow', () => {
    expect(
      countEquipmentPickerStructuredFilters({
        selectedKind: 'weapon',
        showAffordableOnly: true,
        workflowMode: 'magic_items',
      }),
    ).toBe(0)
    expect(
      countEquipmentPickerStructuredFilters({
        selectedKind: 'weapon',
        showAffordableOnly: true,
        workflowMode: 'magic_items',
        focusedAllowanceId: 'startingWealthTier:hero:common',
      }),
    ).toBe(1)
    expect(
      hasEquipmentPickerResetViewCriteria({
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
        workflowMode: 'magic_items',
        focusedAllowanceId: 'startingWealthTier:hero:common',
      }),
    ).toBe(true)
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
    const blockedMagic: EquipmentPickerRow = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:bead-of-force',
        slug: 'bead-of-force',
        name: 'Bead of Force',
      },
      searchDocument: pickerSearchDocument(
        'srd-cc-5.2.1:bead-of-force',
        'bead of force magic item',
      ),
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isWithinRemainingBudget: true,
        recommendation: {
          tier: 'neutral',
          reasons: [],
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

  it('keeps a magic-item name match when the row is blocked', () => {
    const bead: EquipmentPickerRow = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:bead-of-force',
        slug: 'bead-of-force',
        name: 'Bead of Force',
      },
      searchDocument: pickerSearchDocument(
        'srd-cc-5.2.1:bead-of-force',
        'bead of force magic item',
      ),
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isWithinRemainingBudget: true,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        disabledReasons: [],
        magicItemAction: { rank: 3, reason: 'unavailable' },
      }),
    }
    const otherMagic: EquipmentPickerRow = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:other-relic',
        slug: 'other-relic',
        name: 'Other Relic',
      },
      searchDocument: pickerSearchDocument('srd-cc-5.2.1:other-relic', 'other relic magic item'),
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
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
      }).map((item) => item.equipment.name),
    ).toEqual(['Bead of Force'])
  })

  it('does not reorder magic items by action rank', () => {
    const grantAvailable: EquipmentPickerRow = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:zebra-relic',
        slug: 'zebra-relic',
        name: 'Zebra Relic',
      },
      searchDocument: pickerSearchDocument('srd-cc-5.2.1:zebra-relic', 'zebra relic magic item'),
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isWithinRemainingBudget: true,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        disabledReasons: [],
        magicItemAction: { rank: 0, reason: 'grant_available' },
      }),
    }
    const unavailable: EquipmentPickerRow = {
      equipment: {
        ...equipmentPickerPotionFixture,
        id: 'srd-cc-5.2.1:alpha-relic',
        slug: 'alpha-relic',
        name: 'Alpha Relic',
      },
      searchDocument: pickerSearchDocument('srd-cc-5.2.1:alpha-relic', 'alpha relic magic item'),
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isWithinRemainingBudget: true,
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        disabledReasons: [],
        magicItemAction: { rank: 3, reason: 'unavailable' },
      }),
    }

    expect(
      filterAndSortEquipmentPickerItems([grantAvailable, unavailable], {
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
      }).map((item) => item.equipment.name),
    ).toEqual(['Alpha Relic', 'Zebra Relic'])
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

  it('ranks stronger search matches above higher recommendation tiers', () => {
    const essentialLongsword: EquipmentPickerRow = {
      ...equipmentPickerItemsFixture[0]!,
      searchDocument: pickerSearchDocument(
        equipmentPickerItemsFixture[0]!.equipment.id,
        'auxiliary rope cord martial melee weapon',
      ),
    }
    const neutralRope = {
      ...equipmentPickerItemsFixture[2]!,
      searchDocument: pickerSearchDocument(
        equipmentPickerItemsFixture[2]!.equipment.id,
        'rope adventuring gear',
      ),
    }

    expect(
      filterAndSortEquipmentPickerItems([essentialLongsword, neutralRope], {
        searchQuery: 'rope',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
      }).map((item) => item.equipment.name),
    ).toEqual(['Rope', 'Longsword'])
  })

  it('sorts by price ascending with best-match tiebreaker for equal prices', () => {
    const cheapRope: EquipmentPickerRow = {
      ...equipmentPickerItemsFixture[2]!,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:cheap-rope',
        slug: 'cheap-rope',
        name: 'Cheap Rope',
        cost: { amount: 1, currency: 'gp' },
      },
      searchDocument: pickerSearchDocument(
        'srd-cc-5.2.1:cheap-rope',
        'cheap rope adventuring gear',
      ),
    }
    const priceyRope: EquipmentPickerRow = {
      ...equipmentPickerItemsFixture[2]!,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:pricey-rope',
        slug: 'pricey-rope',
        name: 'Pricey Rope',
        cost: { amount: 5, currency: 'gp' },
      },
      searchDocument: pickerSearchDocument(
        'srd-cc-5.2.1:pricey-rope',
        'pricey rope adventuring gear',
      ),
    }

    const sorted = filterAndSortEquipmentPickerItems([priceyRope, cheapRope], {
      searchQuery: '',
      sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
    })

    expect(sorted.map((item) => item.equipment.name)).toEqual(['Cheap Rope', 'Pricey Rope'])
  })

  it('sorts priceless items after priced rows in both price directions', () => {
    const priced = equipmentPickerItemsFixture[2]!
    const priceless: EquipmentPickerRow = {
      ...equipmentPickerItemsFixture[2]!,
      equipment: {
        ...equipmentPickerRopeFixture,
        id: 'srd-cc-5.2.1:priceless-rope',
        slug: 'priceless-rope',
        name: 'Priceless Rope',
        cost: null,
      },
      searchDocument: pickerSearchDocument(
        'srd-cc-5.2.1:priceless-rope',
        'priceless rope adventuring gear',
      ),
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

  it('ranks a literal name hit above a keyword hit and uses search score after price', () => {
    const base = equipmentPickerItemsFixture[2]!
    const nameHit: EquipmentPickerRow = {
      ...base,
      equipment: {
        ...base.equipment,
        id: 'name-hit',
        slug: 'glassember-rope',
        name: 'Glassember Rope',
      },
      searchDocument: {
        id: 'name-hit',
        fields: [
          { key: 'name', text: 'Glassember Rope', role: 'primary' },
          { key: 'tag:0', text: 'hemp', role: 'keyword' },
          { key: 'description', text: 'coil', role: 'secondary' },
          { key: 'combined', text: 'Glassember Rope hemp coil', role: 'secondary' },
        ],
      },
    }
    const keywordHit: EquipmentPickerRow = {
      ...base,
      equipment: { ...base.equipment, id: 'keyword-hit', slug: 'plain-rope', name: 'Plain Rope' },
      searchDocument: {
        id: 'keyword-hit',
        fields: [
          { key: 'name', text: 'Plain Rope', role: 'primary' },
          { key: 'tag:0', text: 'glassember', role: 'keyword' },
          { key: 'description', text: 'coil', role: 'secondary' },
          { key: 'combined', text: 'Plain Rope glassember coil', role: 'secondary' },
        ],
      },
    }

    expect(
      filterAndSortEquipmentPickerItems([keywordHit, nameHit], {
        searchQuery: 'ember',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
      }).map((item) => item.equipment.name),
    ).toEqual(['Glassember Rope', 'Plain Rope'])

    const sameCostLowScore: EquipmentPickerRow = {
      ...keywordHit,
      equipment: { ...keywordHit.equipment, id: 'alpha-gear', name: 'Alpha Gear' },
    }
    const sameCostHighScore: EquipmentPickerRow = {
      ...nameHit,
      equipment: { ...nameHit.equipment, id: 'zebra-gear', name: 'Zebra Gear' },
    }

    expect(
      filterAndSortEquipmentPickerItems([sameCostLowScore, sameCostHighScore], {
        searchQuery: 'ember',
        sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
      }).map((item) => item.equipment.name),
    ).toEqual(['Zebra Gear', 'Alpha Gear'])
    expect(
      filterAndSortEquipmentPickerItems([sameCostHighScore, sameCostLowScore], {
        searchQuery: 'ember',
        sortMode: EQUIPMENT_PICKER_SORT_NAME_ASC,
      }).map((item) => item.equipment.name),
    ).toEqual(['Alpha Gear', 'Zebra Gear'])
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
})
