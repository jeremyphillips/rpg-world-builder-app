import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../content/equipment'

import { equipmentIdMatchesReference, resolveEquipmentByReference } from './equipment-id-match'

const RULESET = 'srd-cc-5.2.1' as const

const CONTENT_META = {
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const lute = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:lute`,
  slug: 'lute',
  name: 'Lute',
  description: '',
  cost: { amount: 35, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const catalog = new Map([[lute.id, lute]])

describe('equipmentIdMatchesReference', () => {
  it('matches canonical id, bare slug, and ruleset-qualified slug', () => {
    expect(
      equipmentIdMatchesReference({ reference: lute.id, equipment: lute, rulesetId: RULESET }),
    ).toBe(true)
    expect(
      equipmentIdMatchesReference({ reference: 'lute', equipment: lute, rulesetId: RULESET }),
    ).toBe(true)
    expect(
      equipmentIdMatchesReference({
        reference: `${RULESET}:lute`,
        equipment: lute,
        rulesetId: RULESET,
      }),
    ).toBe(true)
    expect(
      equipmentIdMatchesReference({ reference: 'flute', equipment: lute, rulesetId: RULESET }),
    ).toBe(false)
  })
})

describe('resolveEquipmentByReference', () => {
  it('resolves rows by id or slug', () => {
    expect(
      resolveEquipmentByReference({ reference: lute.id, equipment: catalog, rulesetId: RULESET }),
    ).toBe(lute)
    expect(
      resolveEquipmentByReference({ reference: 'lute', equipment: catalog, rulesetId: RULESET }),
    ).toBe(lute)
  })
})
