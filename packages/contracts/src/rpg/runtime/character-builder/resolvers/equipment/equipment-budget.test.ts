import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import {
  formatWealth,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
} from '../../../../primitives/wealth'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import { deriveEquipmentBudgetSummary, maxAffordableEquipmentQuantity } from './equipment-budget'
import {
  deriveEquipmentBudgetSummaryFromFunding,
  resolveStartingEquipmentFundingOptions,
} from './resolve-starting-equipment-funding'

const RULESET = 'srd-cc-5.2.1' as const

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light', 'shields'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            { kind: 'grant', target: { source: 'equipment', equipmentSlug: 'rope' }, quantity: 1 },
          ],
          wealth: { gp: 9, sp: 5, cp: 3 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
}

describe('deriveEquipmentBudgetSummary', () => {
  it('derives starting, spent, and remaining from purchases', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedDruid],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: rope.id,
            quantity: 3,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: true,
      },
    }

    const budget = deriveEquipmentBudgetSummary(draft, catalogIndex)

    expect(budget).toEqual({
      starting: { cp: 3, sp: 5, gp: 9, pp: 0 },
      spent: { cp: 0, sp: 0, gp: 3, pp: 0 },
      remaining: { cp: 3, sp: 5, gp: 6, pp: 0 },
    })
    expect(wealthToCopper(budget!.remaining)).toBeLessThanOrEqual(wealthToCopper(budget!.starting))
  })

  it('computes max affordable quantity from remaining budget', () => {
    const budget = {
      starting: { cp: 0, sp: 0, gp: 10, pp: 0 },
      spent: { cp: 0, sp: 0, gp: 4, pp: 0 },
      remaining: { cp: 0, sp: 0, gp: 6, pp: 0 },
    }

    expect(maxAffordableEquipmentQuantity(rope, budget, 2)).toBe(8)
  })
})

describe('resolveStartingEquipmentFundingOptions', () => {
  it('includes tier bonus for wealth-only options', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedDruid],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 5 as const },
    }

    const fundingByOptionId = resolveStartingEquipmentFundingOptions({
      draft,
      catalogIndex,
      startingWealth: {
        name: 'Tier bonus',
        scope: { kind: 'standard' },
        tiers: [
          {
            id: 'tier-5',
            label: 'Level 5+',
            minLevel: 5,
            maxLevel: 20,
            includeNormalStartingEquipment: true,
            magicItemGrants: [],
            bonusGold: {
              baseGp: 100,
              formula: {
                kind: 'dice',
                dice: { count: 1, faces: 6 },
                multiplier: 0,
                currency: 'gp',
              },
            },
          },
        ],
      },
    })

    expect(wealthToCopper(fundingByOptionId.get('starting-gold')!.totalStartingWealth)).toBe(15_000)
  })

  it('marks funding inactive and tier-only when class options are replaced', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedDruid],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 19 as const },
    }

    const fundingByOptionId = resolveStartingEquipmentFundingOptions({
      draft,
      catalogIndex,
      startingWealth: {
        name: 'Legend',
        scope: { kind: 'standard' },
        tiers: [
          {
            id: 'legend',
            label: 'Legend',
            minLevel: 19,
            maxLevel: 20,
            includeNormalStartingEquipment: false,
            magicItemGrants: [],
            bonusGold: {
              baseGp: 21_375,
              formula: {
                kind: 'dice',
                dice: { count: 1, faces: 6 },
                multiplier: 0,
                currency: 'gp',
              },
            },
          },
        ],
      },
    })

    const gold = fundingByOptionId.get('starting-gold')!
    expect(gold.classOptionPolicy).toBe('replaced')
    expect(gold.classOptionId).toBeUndefined()
    expect(wealthToCopper(gold.classOptionWealth)).toBe(0)
    expect(wealthToCopper(gold.totalStartingWealth)).toBe(2_137_500)
  })

  it('keeps tier delta equal to class-option wealth delta', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedDruid],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 19 as const },
    }

    const startingWealth = {
      name: 'Legend tier',
      scope: { kind: 'standard' as const },
      tiers: [
        {
          id: 'legend',
          label: 'Legend',
          minLevel: 19,
          maxLevel: 20,
          includeNormalStartingEquipment: true,
          magicItemGrants: [],
          bonusGold: {
            baseGp: 21_375,
            formula: {
              kind: 'dice' as const,
              dice: { count: 1, faces: 6 as const },
              multiplier: 0,
              currency: 'gp' as const,
            },
          },
        },
      ],
    }

    const fundingByOptionId = resolveStartingEquipmentFundingOptions({
      draft,
      catalogIndex,
      startingWealth,
    })

    const standard = fundingByOptionId.get('standard-equipment')!
    const gold = fundingByOptionId.get('starting-gold')!

    expect(
      wealthToCopper(gold.totalStartingWealth) - wealthToCopper(standard.totalStartingWealth),
    ).toBe(wealthToCopper(gold.classOptionWealth) - wealthToCopper(standard.classOptionWealth))
  })
})

describe('deriveEquipmentBudgetSummaryFromFunding', () => {
  it('matches deriveEquipmentBudgetSummary for the same snapshot', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedDruid],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rope.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const funding = resolveStartingEquipmentFundingOptions({ draft, catalogIndex }).get(
      'starting-gold',
    )!
    const fromFunding = deriveEquipmentBudgetSummaryFromFunding({
      funding,
      purchases: draft.equipment.purchases,
      catalogIndex,
    })
    const fromDraft = deriveEquipmentBudgetSummary(draft, catalogIndex)

    expect(fromFunding).toEqual(fromDraft)
  })
})

describe('equipment-budget re-exports', () => {
  it('re-exports wealth helpers from primitives', () => {
    const starting = { cp: 3, sp: 5, gp: 9, pp: 0 }
    expect(wealthToCopper(starting)).toBe(953)
    expect(moneyToCopper({ amount: 2, currency: 'gp' })).toBe(200)

    const remaining = subtractFromWealth(starting, { amount: 4, currency: 'gp' })
    expect(formatWealth(remaining)).toBe('5 GP, 5 SP, 3 CP')
  })
})
