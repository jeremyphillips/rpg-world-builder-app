import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import { buildEquipmentPickerSearchText } from './format-equipment-picker-metadata'
import { isEquipmentAffordable, wealthToCopper } from './equipment-budget'

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
  description: '<p>Hempen rope.</p>',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

describe('format-equipment-picker-metadata', () => {
  it('builds searchable text from name, kind, and description', () => {
    expect(buildEquipmentPickerSearchText(rope)).toContain('Rope')
    expect(buildEquipmentPickerSearchText(rope)).toContain('Adventuring Gear')
    expect(buildEquipmentPickerSearchText(rope)).toContain('Hempen rope')
  })
})

describe('equipment-budget', () => {
  it('compares affordability using remaining wealth in copper', () => {
    const budget = {
      starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
      spent: { cp: 0, sp: 0, gp: 60, pp: 0 },
      remaining: { cp: 0, sp: 0, gp: 40, pp: 0 },
    }

    expect(wealthToCopper(budget.remaining)).toBe(4000)
    expect(isEquipmentAffordable(rope, budget)).toBe(true)
    expect(isEquipmentAffordable({ ...rope, cost: { amount: 75, currency: 'gp' } }, budget)).toBe(
      false,
    )
  })
})
