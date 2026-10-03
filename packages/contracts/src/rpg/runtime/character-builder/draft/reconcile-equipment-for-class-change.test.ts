import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import { createCharacterBuildContext } from '../test-fixtures'
import { reconcileEquipmentForClassChange } from './apply-selected-class-change'
import type { CharacterBuilderDraftEquipment } from './draft'

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
      { equipmentId: `${RULESET}:greatsword`, quantity: 1, sourceMode: 'startingGold' },
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

  it('keeps an explicit picker-cart purchase and drops untagged startingGold', () => {
    const next = reconcileEquipmentForClassChange({
      equipment: equipment({
        purchases: [
          {
            equipmentId: longsword.id,
            quantity: 1,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
          { equipmentId: `${RULESET}:greatsword`, quantity: 1, sourceMode: 'startingGold' },
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

    expect(next?.purchases).toEqual([
      {
        equipmentId: longsword.id,
        quantity: 1,
        sourceMode: 'startingGold',
        origin: 'picker',
      },
    ])
  })
})
