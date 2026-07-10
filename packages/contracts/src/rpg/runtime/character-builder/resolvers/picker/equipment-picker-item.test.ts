import { describe, expect, it } from 'vitest'

import { type Equipment } from '../../../../content/equipment'
import { DEFAULT_SYSTEM_RULESET_ID } from '../../../../primitives/ruleset'
import {
  EQUIPMENT_RECOMMENDATION_REASON_RANK,
  getBestEquipmentRecommendationReasonRank,
  type EquipmentRecommendation,
} from '../../../../content/equipment-recommendation'
import {
  compareEquipmentPickerItemsByRecommendation,
  type EquipmentPickerItem,
} from './equipment-picker-item'
import {
  EQUIPMENT_RECOMMENDATION_KIND_RANK,
  getEquipmentRecommendationKindRank,
} from './equipment-picker-item-kind-rank'

const baseEquipmentFields = {
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  cost: { amount: 1, currency: 'gp' as const },
}

function makeEquipment(
  overrides: Partial<Equipment> & Pick<Equipment, 'id' | 'slug' | 'name' | 'kind'>,
): Equipment {
  return { ...baseEquipmentFields, ...overrides } as Equipment
}

function makePickerItem(
  equipment: Equipment,
  recommendation: Pick<EquipmentRecommendation, 'tier' | 'reasons'> &
    Partial<Pick<EquipmentRecommendation, 'specificity' | 'label'>>,
  affordability: Pick<EquipmentPickerItem['state'], 'isAffordable' | 'isWithinRemainingBudget'> = {
    isAffordable: true,
    isWithinRemainingBudget: true,
  },
): EquipmentPickerItem {
  return {
    equipment,
    searchText: equipment.name.toLowerCase(),
    state: {
      isAvailable: true,
      isRecommended: recommendation.tier === 'essential' || recommendation.tier === 'strong',
      isProficient: true,
      ...affordability,
      recommendation: {
        ...recommendation,
        specificity: recommendation.specificity ?? 'exact',
      },
      disabledReasons: [],
    },
  }
}

describe('getBestEquipmentRecommendationReasonRank', () => {
  it('returns the lowest rank among multiple reasons', () => {
    expect(getBestEquipmentRecommendationReasonRank(['startingEquipment', 'classToolNeed'])).toBe(
      EQUIPMENT_RECOMMENDATION_REASON_RANK.classToolNeed,
    )
  })

  it('returns positive infinity when reasons are empty', () => {
    expect(getBestEquipmentRecommendationReasonRank([])).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('getEquipmentRecommendationKindRank', () => {
  it('classifies kind buckets for browse ordering', () => {
    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:longsword',
          slug: 'longsword',
          name: 'Longsword',
          kind: 'weapon',
          category: 'martial',
          mode: 'melee',
          damage: { kind: 'dice', count: 1, faces: 8 },
          damageType: 'slashing',
          properties: [],
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.weapon)

    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:shield',
          slug: 'shield',
          name: 'Shield',
          kind: 'armor',
          category: 'shields',
          acBonus: 2,
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.shield)

    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:chain-mail',
          slug: 'chain-mail',
          name: 'Chain Mail',
          kind: 'armor',
          category: 'heavy',
          baseAc: 16,
          addDexModifier: false,
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.armor)

    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:thieves-tools',
          slug: 'thieves-tools',
          name: "Thieves' Tools",
          kind: 'tool',
          toolCategory: 'thieves',
          utilizes: [],
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.tool)

    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:wand',
          slug: 'wand',
          name: 'Wand',
          kind: 'adventuring_gear',
          gearKind: 'spellcasting',
          spellcastingGearKind: 'arcane_focus',
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.spellcastingGear)

    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:rope',
          slug: 'rope',
          name: 'Rope',
          kind: 'adventuring_gear',
          gearKind: 'general',
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.gear)

    expect(
      getEquipmentRecommendationKindRank(
        makeEquipment({
          id: 'test:arrows',
          slug: 'arrows',
          name: 'Arrows',
          kind: 'adventuring_gear',
          gearKind: 'ammunition',
        }),
      ),
    ).toBe(EQUIPMENT_RECOMMENDATION_KIND_RANK.ammunition)
  })
})

describe('compareEquipmentPickerItemsByRecommendation', () => {
  it('orders essential classRequired before strong startingEquipment', () => {
    const classRequired = makePickerItem(
      makeEquipment({
        id: 'test:spellbook',
        slug: 'spellbook',
        name: 'Spellbook',
        kind: 'adventuring_gear',
        gearKind: 'spellcasting',
        spellcastingGearKind: 'spellbook',
      }),
      { tier: 'essential', reasons: ['classRequired'] },
    )
    const startingWeapon = makePickerItem(
      makeEquipment({
        id: 'test:longsword',
        slug: 'longsword',
        name: 'Longsword',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 8 },
        damageType: 'slashing',
        properties: [],
      }),
      { tier: 'strong', reasons: ['startingEquipment'] },
    )

    expect(compareEquipmentPickerItemsByRecommendation(classRequired, startingWeapon)).toBeLessThan(
      0,
    )
  })

  it('orders classToolNeed before startingEquipment within the same tier', () => {
    const tool = makePickerItem(
      makeEquipment({
        id: 'test:thieves-tools',
        slug: 'thieves-tools',
        name: "Thieves' Tools",
        kind: 'tool',
        toolCategory: 'thieves',
        utilizes: [],
      }),
      { tier: 'essential', reasons: ['classToolNeed'] },
    )
    const weapon = makePickerItem(
      makeEquipment({
        id: 'test:shortsword',
        slug: 'shortsword',
        name: 'Shortsword',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 6 },
        damageType: 'piercing',
        properties: ['finesse', 'light'],
      }),
      { tier: 'essential', reasons: ['startingEquipment'] },
    )

    expect(compareEquipmentPickerItemsByRecommendation(tool, weapon)).toBeLessThan(0)
  })

  it('orders spellcastingFocus before classSuggested within the same tier', () => {
    const focus = makePickerItem(
      makeEquipment({
        id: 'test:wand',
        slug: 'wand',
        name: 'Wand',
        kind: 'adventuring_gear',
        gearKind: 'spellcasting',
        spellcastingGearKind: 'arcane_focus',
      }),
      { tier: 'essential', reasons: ['spellcastingFocus'] },
    )
    const suggested = makePickerItem(
      makeEquipment({
        id: 'test:component-pouch',
        slug: 'component-pouch',
        name: 'Component Pouch',
        kind: 'adventuring_gear',
        gearKind: 'spellcasting',
        spellcastingGearKind: 'component_pouch',
      }),
      { tier: 'essential', reasons: ['classSuggested'] },
    )

    expect(compareEquipmentPickerItemsByRecommendation(focus, suggested)).toBeLessThan(0)
  })

  it('orders weapon before ammunition and shield before armor when tier and reason tie', () => {
    const weapon = makePickerItem(
      makeEquipment({
        id: 'test:longsword',
        slug: 'longsword',
        name: 'Longsword',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 8 },
        damageType: 'slashing',
        properties: [],
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )
    const arrows = makePickerItem(
      makeEquipment({
        id: 'test:arrows',
        slug: 'arrows',
        name: 'Arrows',
        kind: 'adventuring_gear',
        gearKind: 'ammunition',
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )
    const shield = makePickerItem(
      makeEquipment({
        id: 'test:shield',
        slug: 'shield',
        name: 'Shield',
        kind: 'armor',
        category: 'shields',
        acBonus: 2,
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )
    const armor = makePickerItem(
      makeEquipment({
        id: 'test:leather',
        slug: 'leather-armor',
        name: 'Leather Armor',
        kind: 'armor',
        category: 'light',
        baseAc: 11,
        addDexModifier: true,
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )

    expect(compareEquipmentPickerItemsByRecommendation(weapon, arrows)).toBeLessThan(0)
    expect(compareEquipmentPickerItemsByRecommendation(shield, armor)).toBeLessThan(0)
  })

  it('does not let kind rank outrank a better reason', () => {
    const classTool = makePickerItem(
      makeEquipment({
        id: 'test:thieves-tools',
        slug: 'thieves-tools',
        name: "Thieves' Tools",
        kind: 'tool',
        toolCategory: 'thieves',
        utilizes: [],
      }),
      { tier: 'essential', reasons: ['classToolNeed'] },
    )
    const startingWeapon = makePickerItem(
      makeEquipment({
        id: 'test:longsword',
        slug: 'longsword',
        name: 'Longsword',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 8 },
        damageType: 'slashing',
        properties: [],
      }),
      { tier: 'essential', reasons: ['startingEquipment'] },
    )

    expect(compareEquipmentPickerItemsByRecommendation(classTool, startingWeapon)).toBeLessThan(0)
  })

  it('sorts items with empty reasons after reasoned peers in the same tier', () => {
    const reasoned = makePickerItem(
      makeEquipment({
        id: 'test:rope',
        slug: 'rope',
        name: 'Rope',
        kind: 'adventuring_gear',
        gearKind: 'general',
      }),
      { tier: 'neutral', reasons: ['proficient'] },
    )
    const noReasons = makePickerItem(
      makeEquipment({
        id: 'test:torch',
        slug: 'torch',
        name: 'Torch',
        kind: 'adventuring_gear',
        gearKind: 'general',
      }),
      { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
    )

    expect(compareEquipmentPickerItemsByRecommendation(reasoned, noReasons)).toBeLessThan(0)
  })

  it('orders starting-affordable rows above starting-unaffordable within the same tier and reason', () => {
    const affordable = makePickerItem(
      makeEquipment({
        id: 'test:staff',
        slug: 'staff',
        name: 'Staff',
        kind: 'adventuring_gear',
        gearKind: 'spellcasting',
        spellcastingGearKind: 'arcane_focus',
      }),
      { tier: 'essential', reasons: ['spellcastingFocus'] },
      { isAffordable: true, isWithinRemainingBudget: true },
    )
    const unaffordable = makePickerItem(
      makeEquipment({
        id: 'test:orb',
        slug: 'orb',
        name: 'Orb',
        kind: 'adventuring_gear',
        gearKind: 'spellcasting',
        spellcastingGearKind: 'arcane_focus',
      }),
      { tier: 'essential', reasons: ['spellcastingFocus'] },
      { isAffordable: false, isWithinRemainingBudget: false },
    )

    expect(compareEquipmentPickerItemsByRecommendation(affordable, unaffordable)).toBeLessThan(0)
  })

  it('orders specificity before reason within the same tier', () => {
    const broadPool = makePickerItem(
      makeEquipment({
        id: 'test:lute',
        slug: 'lute',
        name: 'Lute',
        kind: 'tool',
        toolCategory: 'musical_instrument',
        utilizes: [],
      }),
      {
        tier: 'strong',
        reasons: ['unresolvedToolProficiencyChoice'],
        specificity: 'broad_pool',
      },
    )
    const exactGrant = makePickerItem(
      makeEquipment({
        id: 'test:leather-armor',
        slug: 'leather-armor',
        name: 'Leather Armor',
        kind: 'armor',
        category: 'light',
        baseAc: 11,
        addDexModifier: true,
      }),
      {
        tier: 'strong',
        reasons: ['availableInStartingOption'],
        specificity: 'exact',
      },
    )

    expect(compareEquipmentPickerItemsByRecommendation(exactGrant, broadPool)).toBeLessThan(0)
  })

  it('orders exact before narrow_pool before broad_pool with the same tier and reason', () => {
    const exact = makePickerItem(
      makeEquipment({
        id: 'test:exact',
        slug: 'exact',
        name: 'Exact',
        kind: 'tool',
        toolCategory: 'thieves',
        utilizes: [],
      }),
      { tier: 'strong', reasons: ['selectedToolProficiency'], specificity: 'exact' },
    )
    const narrow = makePickerItem(
      makeEquipment({
        id: 'test:narrow',
        slug: 'narrow',
        name: 'Narrow',
        kind: 'tool',
        toolCategory: 'thieves',
        utilizes: [],
      }),
      { tier: 'strong', reasons: ['selectedToolProficiency'], specificity: 'narrow_pool' },
    )
    const broad = makePickerItem(
      makeEquipment({
        id: 'test:broad',
        slug: 'broad',
        name: 'Broad',
        kind: 'tool',
        toolCategory: 'thieves',
        utilizes: [],
      }),
      { tier: 'strong', reasons: ['selectedToolProficiency'], specificity: 'broad_pool' },
    )

    expect(compareEquipmentPickerItemsByRecommendation(exact, narrow)).toBeLessThan(0)
    expect(compareEquipmentPickerItemsByRecommendation(narrow, broad)).toBeLessThan(0)
  })

  it('breaks final ties with base localeCompare on name', () => {
    const alpha = makePickerItem(
      makeEquipment({
        id: 'test:alpha',
        slug: 'alpha',
        name: 'Alpha Rope',
        kind: 'adventuring_gear',
        gearKind: 'general',
      }),
      { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
    )
    const beta = makePickerItem(
      makeEquipment({
        id: 'test:beta',
        slug: 'beta',
        name: 'beta rope',
        kind: 'adventuring_gear',
        gearKind: 'general',
      }),
      { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
    )

    expect(compareEquipmentPickerItemsByRecommendation(alpha, beta)).toBeLessThan(0)
  })

  it('orders martial weapons before simple when dual-category browse preference is enabled', () => {
    const battleaxe = makePickerItem(
      makeEquipment({
        id: 'test:battleaxe',
        slug: 'battleaxe',
        name: 'Battleaxe',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 8 },
        damageType: 'slashing',
        properties: [],
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )
    const dagger = makePickerItem(
      makeEquipment({
        id: 'test:dagger',
        slug: 'dagger',
        name: 'Dagger',
        kind: 'weapon',
        category: 'simple',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 4 },
        damageType: 'piercing',
        properties: ['finesse', 'light', 'thrown'],
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )

    expect(
      compareEquipmentPickerItemsByRecommendation(battleaxe, dagger, {
        preferMartialWeaponBrowseOrder: true,
      }),
    ).toBeLessThan(0)
  })

  it('does not reorder simple and martial weapons without dual-category browse preference', () => {
    const warhammer = makePickerItem(
      makeEquipment({
        id: 'test:warhammer',
        slug: 'warhammer',
        name: 'Warhammer',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 8 },
        damageType: 'bludgeoning',
        properties: [],
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )
    const mace = makePickerItem(
      makeEquipment({
        id: 'test:mace',
        slug: 'mace',
        name: 'Mace',
        kind: 'weapon',
        category: 'simple',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 6 },
        damageType: 'bludgeoning',
        properties: [],
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )

    expect(
      compareEquipmentPickerItemsByRecommendation(mace, warhammer, {
        preferMartialWeaponBrowseOrder: false,
      }),
    ).toBeLessThan(0)
    expect(
      compareEquipmentPickerItemsByRecommendation(warhammer, mace, {
        preferMartialWeaponBrowseOrder: true,
      }),
    ).toBeLessThan(0)
  })

  it('does not let weapon category outrank a better recommendation reason', () => {
    const startingDagger = makePickerItem(
      makeEquipment({
        id: 'test:dagger',
        slug: 'dagger',
        name: 'Dagger',
        kind: 'weapon',
        category: 'simple',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 4 },
        damageType: 'piercing',
        properties: ['finesse', 'light', 'thrown'],
      }),
      { tier: 'strong', reasons: ['startingEquipment'] },
    )
    const compatibleBattleaxe = makePickerItem(
      makeEquipment({
        id: 'test:battleaxe',
        slug: 'battleaxe',
        name: 'Battleaxe',
        kind: 'weapon',
        category: 'martial',
        mode: 'melee',
        damage: { kind: 'dice', count: 1, faces: 8 },
        damageType: 'slashing',
        properties: [],
      }),
      { tier: 'compatible', reasons: ['proficient'] },
    )

    expect(
      compareEquipmentPickerItemsByRecommendation(startingDagger, compatibleBattleaxe, {
        preferMartialWeaponBrowseOrder: true,
      }),
    ).toBeLessThan(0)
  })
})
