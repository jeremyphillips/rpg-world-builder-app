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

const RULESET = 'srd-cc-5.2.1' as const

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
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
          id: 'standard',
          label: 'Standard Equipment',
          items: [],
          wealth: { gp: 9, sp: 5, cp: 3 },
        },
        {
          id: 'gold',
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
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard'],
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

describe('equipment-budget re-exports', () => {
  it('re-exports wealth helpers from primitives', () => {
    const starting = { cp: 3, sp: 5, gp: 9, pp: 0 }
    expect(wealthToCopper(starting)).toBe(953)
    expect(moneyToCopper({ amount: 2, currency: 'gp' })).toBe(200)

    const remaining = subtractFromWealth(starting, { amount: 4, currency: 'gp' })
    expect(formatWealth(remaining)).toBe('5 GP, 5 SP, 3 CP')
  })
})
