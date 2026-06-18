import { describe, expect, it } from 'vitest'
import {
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS,
  createEquipmentInputSchema,
  equipmentPatchSchema,
  equipmentSchema,
  getEquipmentKindLabel,
  updateEquipmentInputSchema,
} from './equipment'
import type { EquipmentKind } from './equipment'

const meta = {
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
} as const

function systemRecord(slug: string, body: Record<string, unknown>) {
  return { id: `srd-cc-5.2.1:${slug}`, slug, ...meta, ...body }
}

const SAMPLE_BODIES = {
  gear: {
    kind: 'gear',
    name: 'Torch',
    cost: { amount: 1, currency: 'cp' },
    weight: { value: 1, unit: 'lb' },
    gearCategory: 'lighting',
  },
  ammunition: {
    kind: 'ammunition',
    name: 'Arrows',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    bundleSize: 20,
    storage: 'Quiver',
  },
  focus: {
    kind: 'focus',
    name: 'Orb',
    cost: { amount: 20, currency: 'gp' },
    weight: { value: 3, unit: 'lb' },
    focusType: 'arcane',
  },
  tool: {
    kind: 'tool',
    name: "Smith's Tools",
    cost: { amount: 20, currency: 'gp' },
    weight: { value: 8, unit: 'lb' },
    toolCategory: 'artisan',
    ability: 'str',
  },
  mount: {
    kind: 'mount',
    name: 'Riding Horse',
    cost: { amount: 75, currency: 'gp' },
    carryingCapacity: { value: 480, unit: 'lb' },
    speed: '60 ft.',
  },
  vehicle: {
    kind: 'vehicle',
    name: 'Wagon',
    cost: { amount: 35, currency: 'gp' },
    weight: { value: 400, unit: 'lb' },
  },
  ship: {
    kind: 'ship',
    name: 'Galley',
    cost: { amount: 30000, currency: 'gp' },
    speed: '4 mph',
    crew: 80,
    passengers: 0,
    cargoTons: 150,
    ac: 15,
    hp: 500,
    damageThreshold: 20,
  },
  misc: {
    kind: 'misc',
    name: 'Stabling (per day)',
    cost: { amount: 5, currency: 'sp' },
    notes: 'A service, not an item.',
  },
} satisfies Record<EquipmentKind, Record<string, unknown>>

describe('equipment kind taxonomy', () => {
  it('exposes every kind in EQUIPMENT_KINDS', () => {
    expect([...EQUIPMENT_KINDS].sort()).toEqual(Object.keys(EQUIPMENT_KIND_LABELS).sort())
  })

  it('has a sample body for every kind (keeps this test exhaustive)', () => {
    expect(Object.keys(SAMPLE_BODIES).sort()).toEqual([...EQUIPMENT_KINDS].sort())
  })

  it('returns labels and falls back for unknown kinds', () => {
    expect(getEquipmentKindLabel('ship')).toBe('Ship')
    expect(getEquipmentKindLabel('teleporter')).toBe('teleporter')
  })
})

describe('equipmentSchema', () => {
  it('parses a well-formed system record for every kind', () => {
    for (const [kind, body] of Object.entries(SAMPLE_BODIES)) {
      const parsed = equipmentSchema.parse(systemRecord(kind, body))
      expect(parsed.kind).toBe(kind)
    }
  })

  it('parses a homebrew record (campaignId set)', () => {
    const result = equipmentSchema.safeParse({
      ...systemRecord('lucky-charm', SAMPLE_BODIES.misc),
      id: 'abc123',
      source: 'homebrew',
      campaignId: 'camp_1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown kind', () => {
    const result = equipmentSchema.safeParse(
      systemRecord('mystery', { kind: 'relic', name: 'X', cost: { amount: 1, currency: 'gp' } }),
    )
    expect(result.success).toBe(false)
  })

  it('rejects a record missing a kind-specific required field', () => {
    const { storage: _omit, ...withoutStorage } = SAMPLE_BODIES.ammunition
    expect(equipmentSchema.safeParse(systemRecord('arrows', withoutStorage)).success).toBe(false)

    const { carryingCapacity: _omit2, ...withoutCapacity } = SAMPLE_BODIES.mount
    expect(equipmentSchema.safeParse(systemRecord('pony', withoutCapacity)).success).toBe(false)
  })

  it('rejects a record missing the universal cost field', () => {
    const { cost: _omit, ...withoutCost } = SAMPLE_BODIES.gear
    expect(equipmentSchema.safeParse(systemRecord('torch', withoutCost)).success).toBe(false)
  })
})

describe('createEquipmentInputSchema', () => {
  it('requires a valid slug', () => {
    expect(
      createEquipmentInputSchema.safeParse({ slug: 'torch', ...SAMPLE_BODIES.gear }).success,
    ).toBe(true)
    expect(createEquipmentInputSchema.safeParse(SAMPLE_BODIES.gear).success).toBe(false)
    expect(
      createEquipmentInputSchema.safeParse({ slug: 'Not A Slug', ...SAMPLE_BODIES.gear }).success,
    ).toBe(false)
  })
})

describe('updateEquipmentInputSchema', () => {
  it('allows partial updates but still requires kind', () => {
    expect(
      updateEquipmentInputSchema.safeParse({ kind: 'gear', name: 'Bigger Torch' }).success,
    ).toBe(true)
    expect(updateEquipmentInputSchema.safeParse({ name: 'Bigger Torch' }).success).toBe(false)
  })
})

describe('equipmentPatchSchema', () => {
  it('requires campaignId and targetId and a kind-tagged patch', () => {
    const valid = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: 'srd-cc-5.2.1:torch',
      createdAt: '2024-05-21T00:00:00.000Z',
      updatedAt: '2024-05-21T00:00:00.000Z',
      patch: { kind: 'gear', cost: { amount: 2, currency: 'cp' } },
    }
    expect(equipmentPatchSchema.safeParse(valid).success).toBe(true)

    const { campaignId: _c, ...withoutCampaign } = valid
    expect(equipmentPatchSchema.safeParse(withoutCampaign).success).toBe(false)

    const { targetId: _t, ...withoutTarget } = valid
    expect(equipmentPatchSchema.safeParse(withoutTarget).success).toBe(false)
  })
})
