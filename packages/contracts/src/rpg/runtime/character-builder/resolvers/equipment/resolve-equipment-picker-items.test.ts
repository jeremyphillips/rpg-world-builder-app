import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { wealthToCopper } from '../../../../primitives/wealth'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import { deriveEquipmentBudgetSummary } from './equipment-budget'
import { NEUTRAL_EQUIPMENT_RECOMMENDATION } from '../../../../content/equipment-recommendation'
import { resolveEquipmentPickerItems } from './resolve-equipment-picker-items'

const RULESET = 'srd-cc-5.2.1' as const

const CONTENT_META = {
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const rope = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:rope`,
  slug: 'rope',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const chainMail = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:chain-mail`,
  slug: 'chain-mail',
  name: 'Chain Mail',
  description: '',
  cost: { amount: 75, currency: 'gp' },
  weight: { value: 55, unit: 'lb' },
  kind: 'armor',
  category: 'heavy',
  baseAc: 16,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 13,
})

const plateArmor = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:plate-armor`,
  slug: 'plate-armor',
  name: 'Plate Armor',
  description: '',
  cost: { amount: 1500, currency: 'gp' },
  weight: { value: 65, unit: 'lb' },
  kind: 'armor',
  category: 'heavy',
  baseAc: 18,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 15,
})

const storedFighter: ClassStored = {
  ...CONTENT_META,
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium', 'heavy', 'shields'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 100 },
        },
      ],
    },
  },
}

const emptyProficiencies = {
  savingThrows: [],
  armor: [],
  weapons: [],
  tools: [],
  skills: [],
  languages: [],
}

describe('resolveEquipmentPickerItems', () => {
  const recommendations = new Map([[rope.id, NEUTRAL_EQUIPMENT_RECOMMENDATION]])

  it('defaults both affordability fields to true when no budget applies', () => {
    const [item] = resolveEquipmentPickerItems({
      equipment: [plateArmor],
      proficiencies: emptyProficiencies,
      recommendations,
    })

    expect(item!.state.isAffordable).toBe(true)
    expect(item!.state.isWithinRemainingBudget).toBe(true)
  })

  it('marks items affordable at both starting and remaining budget', () => {
    const [item] = resolveEquipmentPickerItems({
      equipment: [rope],
      proficiencies: emptyProficiencies,
      recommendations,
      budget: {
        starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 100, pp: 0 },
      },
    })

    expect(item!.state.isAffordable).toBe(true)
    expect(item!.state.isWithinRemainingBudget).toBe(true)
  })

  it('marks items affordable at starting only when remaining is depleted', () => {
    const [item] = resolveEquipmentPickerItems({
      equipment: [chainMail],
      proficiencies: emptyProficiencies,
      recommendations,
      budget: {
        starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 60, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 40, pp: 0 },
      },
    })

    expect(item!.state.isAffordable).toBe(true)
    expect(item!.state.isWithinRemainingBudget).toBe(false)
  })

  it('marks items unaffordable at both budgets when cost exceeds starting', () => {
    const [item] = resolveEquipmentPickerItems({
      equipment: [plateArmor],
      proficiencies: emptyProficiencies,
      recommendations,
      budget: {
        starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 100, pp: 0 },
      },
    })

    expect(item!.state.isAffordable).toBe(false)
    expect(item!.state.isWithinRemainingBudget).toBe(false)
  })

  it('keeps remaining within starting on derived budgets', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedFighter],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedFighter.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedFighter.id)]: ['starting-gold'],
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
    expect(budget).toBeDefined()
    expect(wealthToCopper(budget!.remaining)).toBeLessThanOrEqual(wealthToCopper(budget!.starting))
  })
})
