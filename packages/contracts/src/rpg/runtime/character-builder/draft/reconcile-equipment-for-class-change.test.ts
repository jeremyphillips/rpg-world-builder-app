import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import { createCharacterBuildContext } from '../test-fixtures'
import {
  applySelectedClassChange,
  reconcileEquipmentForClassChange,
} from './apply-selected-class-change'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraftEquipment } from './draft'

const RULESET = 'srd-cc-5.2.1' as const

const META = {
  rulesetId: RULESET,
  source: 'system' as const,
  status: 'published' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const longsword = equipmentSchema.parse({
  ...META,
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

const coach = equipmentSchema.parse({
  ...META,
  id: `${RULESET}:coach`,
  slug: 'coach',
  name: 'Coach',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  kind: 'service',
  serviceCategory: 'hireling',
})

const context = createCharacterBuildContext({
  catalog: {
    ...createCharacterBuildContext().catalog,
    equipment: [longsword, coach],
  },
})

function equipment(
  overrides: Partial<CharacterBuilderDraftEquipment> = {},
): CharacterBuilderDraftEquipment {
  return {
    mode: 'gold',
    purchases: [
      { equipmentId: longsword.id, quantity: 1, sourceMode: 'manual' },
      { equipmentId: `${RULESET}:missing`, quantity: 1, sourceMode: 'manual' },
      { equipmentId: coach.id, quantity: 1, sourceMode: 'manual' },
      {
        equipmentId: `${RULESET}:greatsword`,
        quantity: 1,
        sourceMode: 'startingGold',
        origin: 'picker',
      },
    ],
    grants: [{ equipmentId: longsword.id, quantity: 1, contribution: 'additional' }],
    classPackage: {
      state: 'selected',
      packageId: 'heavy-armor',
      intent: 'explicit',
      overrides: { entryQuantities: {} },
    },
    editedSincePackageSelection: true,
    skipped: true,
    ...overrides,
  }
}

describe('reconcileEquipmentForClassChange', () => {
  it('keeps a valid manual purchase when the new class is not proficient with it', () => {
    const next = reconcileEquipmentForClassChange({
      equipment: equipment(),
      previous: { classId: `${RULESET}:fighter`, level: 1 },
      next: { classId: `${RULESET}:wizard`, level: 1 },
      context,
    })

    expect(next?.purchases).toEqual([
      { equipmentId: longsword.id, quantity: 1, sourceMode: 'manual' },
    ])
    expect(next?.grants).toEqual([])
    expect(next?.classPackage).toEqual({ state: 'unresolved' })
    expect(next?.mode).toBe('package')
    expect(next?.editedSincePackageSelection).toBe(false)
    expect(next?.skipped).toBe(false)
  })

  it('returns the same equipment when the class does not change', () => {
    const current = equipment()
    const next = reconcileEquipmentForClassChange({
      equipment: current,
      previous: { classId: `${RULESET}:fighter`, level: 1 },
      next: { classId: `${RULESET}:fighter`, level: 3 },
      context,
    })

    expect(next).toBe(current)
  })

  it('keeps picker rows unchanged and drops package-conversion rows', () => {
    const pickerRow = {
      id: 'picker-longsword',
      equipmentId: longsword.id,
      quantity: 1,
      sourceMode: 'startingGold' as const,
      origin: 'picker' as const,
      unitCostCp: 1500,
    }
    const next = reconcileEquipmentForClassChange({
      equipment: equipment({
        purchases: [
          pickerRow,
          {
            equipmentId: longsword.id,
            quantity: 2,
            sourceMode: 'startingGold',
            origin: 'packageConversion',
          },
        ],
      }),
      previous: { classId: `${RULESET}:fighter`, level: 1 },
      next: { classId: `${RULESET}:wizard`, level: 1 },
      context,
    })

    expect(next?.purchases).toEqual([pickerRow])
    expect(next?.purchases[0]).toBe(pickerRow)
  })

  it('drops purchases whose equipment is no longer playable picker content', () => {
    const next = reconcileEquipmentForClassChange({
      equipment: equipment({
        purchases: [
          { equipmentId: coach.id, quantity: 1, sourceMode: 'startingGold', origin: 'picker' },
          { equipmentId: `${RULESET}:missing`, quantity: 1, sourceMode: 'manual' },
        ],
      }),
      previous: { classId: `${RULESET}:fighter`, level: 1 },
      next: { classId: `${RULESET}:wizard`, level: 1 },
      context,
    })

    expect(next?.purchases).toEqual([])
  })
})

describe('applySelectedClassChange', () => {
  it('leaves purchase retention entirely to reconcileEquipmentForClassChange', () => {
    const current = equipment({
      purchases: [
        { equipmentId: longsword.id, quantity: 1, sourceMode: 'startingGold', origin: 'picker' },
        {
          equipmentId: longsword.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'packageConversion',
        },
        { equipmentId: coach.id, quantity: 1, sourceMode: 'manual' },
      ],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: `${RULESET}:fighter`, level: 1 as const },
      choiceSelections: {
        [`class:${RULESET}:fighter:starting-equipment`]: ['heavy-armor'],
        [`class:${RULESET}:fighter:starting-equipment:heavy-armor:0`]: [longsword.id],
      },
      equipment: current,
    }

    const changed = applySelectedClassChange({
      draft,
      nextClassId: `${RULESET}:wizard`,
      context,
    })
    const reconciled = reconcileEquipmentForClassChange({
      equipment: current,
      previous: { classId: `${RULESET}:fighter`, level: 1 },
      next: { classId: `${RULESET}:wizard`, level: 1 },
      context,
    })

    expect(changed.equipment?.purchases).toEqual(reconciled?.purchases)
    expect(changed.equipment?.purchases).toEqual([
      { equipmentId: longsword.id, quantity: 1, sourceMode: 'startingGold', origin: 'picker' },
    ])
  })
})
