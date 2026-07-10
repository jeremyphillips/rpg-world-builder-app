import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerRopeFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
} from './equipment-picker-drawer.fixtures'
import {
  countEquipmentPickerAffordableHiddenImpact,
  countEquipmentPickerClearableCriteria,
  countEquipmentPickerStructuredFilters,
  filterAndSortEquipmentPickerItems,
  filterEquipmentPickerItems,
  formatEquipmentUnaffordableReason,
  getEquipmentPickerBadge,
  getEquipmentPickerDisabledNote,
  getEquipmentUnaffordableAmounts,
  getEquipmentPickerItemTab,
  hasEquipmentPickerClearableCriteria,
  hasEquipmentPickerResetViewCriteria,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
  sortEquipmentPickerItems,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
  EQUIPMENT_PICKER_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
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
        recommendation: { tier: 'compatible', reasons: ['proficient'], specificity: 'exact' },
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

  it('builds unaffordable copy and warning badges', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    expect(formatEquipmentUnaffordableReason(chainMail, equipmentPickerBudgetFixture)).toBe(
      '75 GP needed · 40 GP remaining',
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
        recommendation: {
          tier: 'essential' as const,
          reasons: ['classToolNeed' as const],
          specificity: 'exact' as const,
        },
      },
    }
    expect(getEquipmentPickerBadge(essentialTool)?.label).toBe('Class tool')

    const essentialRule = {
      ...longsword,
      state: {
        ...longsword.state,
        recommendation: {
          tier: 'essential' as const,
          reasons: ['classRequired' as const],
          specificity: 'exact' as const,
        },
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
          specificity: 'exact' as const,
          label: 'Spellbook',
        },
      },
    }
    expect(getEquipmentPickerBadge(labeledRule)?.label).toBe('Spellbook')
  })

  describe('getEquipmentPickerBadge proficiency and recommendation precedence', () => {
    function badgeItem(
      args: Partial<Omit<EquipmentPickerItem['state'], 'recommendation'>> & {
        recommendation: Pick<EquipmentPickerItem['state']['recommendation'], 'tier' | 'reasons'> &
          Partial<Pick<EquipmentPickerItem['state']['recommendation'], 'specificity' | 'label'>>
      },
    ): EquipmentPickerItem {
      const { recommendation, ...stateOverrides } = args
      const base = equipmentPickerItemsFixture[0]!
      return {
        ...base,
        state: {
          ...base.state,
          ...stateOverrides,
          recommendation: {
            ...recommendation,
            specificity: recommendation.specificity ?? 'exact',
          },
        },
      }
    }

    it('shows Proficiency available for unresolved tool proficiency pools', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: true,
        recommendation: {
          tier: 'strong',
          reasons: ['unresolvedToolProficiencyChoice', 'notProficient'],
        },
      })

      expect(getEquipmentPickerBadge(item)).toEqual({
        label: EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
        emphasis: 'highlight',
      })
    })

    it('prefers Proficiency available over Starting option and Not proficient', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: true,
        recommendation: {
          tier: 'strong',
          reasons: ['unresolvedToolProficiencyChoice', 'startingEquipmentChoice', 'notProficient'],
        },
      })

      expect(getEquipmentPickerBadge(item)?.label).toBe(
        EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
      )
    })

    it('shows Proficient only for selected tool proficiency reason', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: true,
        recommendation: { tier: 'strong', reasons: ['selectedToolProficiency'] },
      })

      expect(getEquipmentPickerBadge(item)?.label).toBe(EQUIPMENT_PICKER_PROFICIENT_LABEL)
    })

    it('shows Common for your class for category siblings', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: false,
        recommendation: { tier: 'compatible', reasons: ['classToolCategory'] },
      })

      expect(getEquipmentPickerBadge(item)?.label).toBe(EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL)
    })

    it('shows Standard gear for gold-path fixed grants', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: true,
        recommendation: { tier: 'strong', reasons: ['availableInStartingOption', 'proficient'] },
      })

      expect(getEquipmentPickerBadge(item, { isGoldShoppingPath: true })?.label).toBe(
        EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
      )
      expect(getEquipmentPickerBadge(item, { isGoldShoppingPath: false })).toBeUndefined()
    })

    it('shows Starting option for unresolved package pools without proficiency overlap', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: true,
        recommendation: { tier: 'strong', reasons: ['startingEquipmentChoice', 'proficient'] },
      })

      expect(getEquipmentPickerBadge(item)?.label).toBe(EQUIPMENT_PICKER_STARTING_OPTION_LABEL)
    })

    it('leaves ordinary proficient weapons without a badge', () => {
      const item = badgeItem({
        isProficient: true,
        isRecommended: false,
        recommendation: { tier: 'compatible', reasons: ['proficient'] },
      })

      expect(getEquipmentPickerBadge(item)).toBeUndefined()
    })

    it('shows Not proficient for unrelated tools', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: false,
        recommendation: { tier: 'notRecommended', reasons: ['notProficient'] },
      })

      expect(getEquipmentPickerBadge(item)).toEqual({
        label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
        emphasis: 'warning',
      })
    })

    it('prefers essential blockers over proficiency-state copy', () => {
      const item = badgeItem({
        isProficient: false,
        isRecommended: true,
        recommendation: {
          tier: 'essential',
          reasons: ['classToolNeed', 'unresolvedToolProficiencyChoice'],
        },
      })

      expect(getEquipmentPickerBadge(item)?.label).toBe('Class tool')
    })
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
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
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
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
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
        cost: undefined as never,
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

  it('detects reset-view criteria including sort and tab drift', () => {
    expect(
      hasEquipmentPickerResetViewCriteria({
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_PRICE_ASC,
        activeTabId: EQUIPMENT_PICKER_TAB_ALL,
        defaultTabId: EQUIPMENT_PICKER_TAB_RECOMMENDED,
      }),
    ).toBe(true)
    expect(
      hasEquipmentPickerResetViewCriteria({
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
        searchQuery: '',
        sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
        activeTabId: EQUIPMENT_PICKER_TAB_RECOMMENDED,
        defaultTabId: EQUIPMENT_PICKER_TAB_RECOMMENDED,
      }),
    ).toBe(false)
  })

  it('counts affordable hidden impact within the active tab after search and structured filters', () => {
    expect(
      countEquipmentPickerAffordableHiddenImpact(equipmentPickerDefaultPathItemsFixture, {
        activeTabId: EQUIPMENT_PICKER_TAB_ALL,
        searchQuery: '',
        filterOutUnaffordable: true,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: true,
      }),
    ).toBe(1)

    expect(
      countEquipmentPickerAffordableHiddenImpact(equipmentPickerDefaultPathItemsFixture, {
        activeTabId: EQUIPMENT_PICKER_TAB_ALL,
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
        activeTabId: EQUIPMENT_PICKER_TAB_ALL,
        searchQuery: '',
        filterOutUnaffordable: true,
        filterOutNonProficient: false,
        selectedKind: EQUIPMENT_PICKER_KIND_ALL,
        showAffordableOnly: false,
      }),
    ).toBe(0)
  })
})
