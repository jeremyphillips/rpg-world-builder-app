import { describe, expect, it } from 'vitest'

import {
  averageWeaponDamage,
  createEquipmentInputSchema,
  equipmentPatchSchema,
  equipmentSchema,
  EQUIPMENT_KIND_ENTRIES,
  EQUIPMENT_KIND_LABELS,
  EQUIPMENT_KINDS,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponRange,
  formatToolUtilizeAction,
  formatToolUtilizes,
  getArmorAcDisplay,
  getEquipmentKindLabel,
  updateEquipmentInputSchema,
} from './equipment'
import type { ArmorBody, EquipmentKind } from './equipment'

const meta = {
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
} as const

function systemRecord(kind: string, body: Record<string, unknown>) {
  const slug = kind.replace(/_/g, '-')
  return { id: `srd-cc-5.2.1:${slug}`, slug, ...meta, ...body }
}

const LONGSWORD_BODY = {
  kind: 'weapon',
  name: 'Longsword',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  versatileDamage: { count: 1, faces: 10 },
  properties: ['versatile'],
  mastery: 'sap',
}

const LONGSWORD_STORED = systemRecord('longsword', LONGSWORD_BODY)

const SHORTBOW_STORED = systemRecord('shortbow', {
  kind: 'weapon',
  name: 'Shortbow',
  cost: { amount: 25, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  category: 'simple',
  mode: 'ranged',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
  properties: ['ammunition', 'two-handed'],
  mastery: 'vex',
  range: { normal: 80, long: 320 },
})

const NET_STORED = systemRecord('net', {
  kind: 'weapon',
  name: 'Net',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  category: 'martial',
  mode: 'ranged',
  properties: ['special', 'thrown'],
  mastery: 'topple',
  range: { normal: 5, long: 15 },
  specialRules: 'A Large or smaller creature hit is Restrained until freed. Escape DC 10.',
})

const BLOWGUN_STORED = systemRecord('blowgun', {
  kind: 'weapon',
  name: 'Blowgun',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  category: 'martial',
  mode: 'ranged',
  damage: { flat: 1 },
  damageType: 'piercing',
  properties: ['ammunition', 'loading'],
  mastery: 'vex',
  range: { normal: 25, long: 100 },
})

const LEATHER_STORED = systemRecord('leather-armor', {
  kind: 'armor',
  name: 'Leather Armor',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  category: 'light',
  material: 'organic',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

const HALF_PLATE_STORED = systemRecord('half-plate-armor', {
  kind: 'armor',
  name: 'Half Plate Armor',
  cost: { amount: 750, currency: 'gp' },
  weight: { value: 40, unit: 'lb' },
  category: 'medium',
  material: 'metal',
  baseAc: 15,
  addDexModifier: true,
  maxDexBonus: 2,
  stealthDisadvantage: true,
})

const PLATE_STORED = systemRecord('plate-armor', {
  kind: 'armor',
  name: 'Plate Armor',
  cost: { amount: 1500, currency: 'gp' },
  weight: { value: 65, unit: 'lb' },
  category: 'heavy',
  material: 'metal',
  baseAc: 18,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 15,
})

const SHIELD_WOOD_STORED = systemRecord('shield-wood', {
  kind: 'armor',
  name: 'Shield (Wood)',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 6, unit: 'lb' },
  category: 'shields',
  material: 'organic',
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
})

const SAMPLE_BODIES = {
  weapon: LONGSWORD_BODY,
  armor: {
    kind: 'armor',
    name: 'Leather',
    cost: { amount: 10, currency: 'gp' },
    category: 'light',
    baseAc: 11,
    addDexModifier: true,
    stealthDisadvantage: false,
  },
  adventuring_gear: {
    kind: 'adventuring_gear',
    name: 'Torch',
    cost: { amount: 1, currency: 'cp' },
    weight: { value: 1, unit: 'lb' },
    gearKind: 'general',
    properties: ['1-hour duration'],
  },
  tool: {
    kind: 'tool',
    name: "Smith's Tools",
    cost: { amount: 20, currency: 'gp' },
    weight: { value: 8, unit: 'lb' },
    toolCategory: 'artisan',
    ability: 'str',
    utilizes: [{ description: 'Pry open a door or container', dc: 20 }],
    crafts: ['Any Melee weapon (except Club, Greatclub, Quarterstaff, and Whip)'],
  },
  mount: {
    kind: 'mount',
    name: 'Riding Horse',
    cost: { amount: 75, currency: 'gp' },
    carryingCapacity: { value: 480, unit: 'lb' },
    speed: { value: 60, unit: 'ft' },
  },
  vehicle: {
    kind: 'vehicle',
    name: 'Galley',
    cost: { amount: 30000, currency: 'gp' },
    vehicleCategory: 'water',
    speed: { value: 4, unit: 'mph' },
    crew: 80,
    cargoCapacity: { value: 150, unit: 'ton' },
    ac: 15,
    hp: 500,
    damageThreshold: 20,
  },
  service: {
    kind: 'service',
    name: 'Skilled Hireling',
    cost: { amount: 2, currency: 'gp' },
    serviceCategory: 'hireling',
    duration: { value: 1, unit: 'day' },
  },
  magic_item: {
    kind: 'magic_item',
    name: 'Bracers of Defense',
    cost: null,
    rarity: 'rare',
    requiresAttunement: true,
    magicItemCategory: 'wondrous_item',
    description: '<p>While wearing these bracers, you gain a +2 bonus to AC...</p>',
  },
} satisfies Record<EquipmentKind, Record<string, unknown>>

describe('equipment kind taxonomy', () => {
  it('exposes every kind in EQUIPMENT_KINDS', () => {
    expect([...EQUIPMENT_KINDS].sort()).toEqual(Object.keys(EQUIPMENT_KIND_LABELS).sort())
    expect([...EQUIPMENT_KINDS].sort()).toEqual(Object.keys(EQUIPMENT_KIND_ENTRIES).sort())
  })

  it('has a sample body for every kind (keeps this test exhaustive)', () => {
    expect(Object.keys(SAMPLE_BODIES).sort()).toEqual([...EQUIPMENT_KINDS].sort())
  })

  it('returns labels and falls back for unknown kinds', () => {
    expect(EQUIPMENT_KIND_LABELS.adventuring_gear).toBe(
      EQUIPMENT_KIND_ENTRIES.adventuring_gear.label,
    )
    expect(getEquipmentKindLabel('magic_item')).toBe('Magic Item')
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
      ...systemRecord('lucky-charm', SAMPLE_BODIES.magic_item),
      id: 'abc123',
      source: 'homebrew',
      status: 'published',
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

  it('rejects adventuring gear missing gearKind', () => {
    const { gearKind: _omit, ...body } = SAMPLE_BODIES.adventuring_gear
    expect(equipmentSchema.safeParse(systemRecord('torch', body)).success).toBe(false)
  })

  it('rejects a mount missing carryingCapacity', () => {
    const { carryingCapacity: _omit, ...body } = SAMPLE_BODIES.mount
    expect(equipmentSchema.safeParse(systemRecord('pony', body)).success).toBe(false)
  })

  it('rejects a record missing the universal cost field', () => {
    const { cost: _omit, ...body } = SAMPLE_BODIES.adventuring_gear
    expect(equipmentSchema.safeParse(systemRecord('torch', body)).success).toBe(false)
  })

  it('rejects zero-cost equipment prices', () => {
    expect(
      equipmentSchema.safeParse(
        systemRecord('free-torch', {
          ...SAMPLE_BODIES.adventuring_gear,
          cost: { amount: 0, currency: 'gp' },
        }),
      ).success,
    ).toBe(false)
  })

  it('accepts null cost for equipment without a market price', () => {
    const parsed = equipmentSchema.parse(
      systemRecord('mystery-charm', {
        ...SAMPLE_BODIES.magic_item,
        cost: null,
      }),
    )
    expect(parsed.cost).toBeNull()
  })
})

describe('weapon equipment variant', () => {
  it('parses melee, ranged, net, and flat-damage weapons', () => {
    expect(equipmentSchema.parse(LONGSWORD_STORED)).toMatchObject({ name: 'Longsword' })
    expect(equipmentSchema.parse(SHORTBOW_STORED)).toMatchObject({ range: { normal: 80 } })
    const net = equipmentSchema.parse(NET_STORED)
    expect(net.kind).toBe('weapon')
    if (net.kind === 'weapon') {
      expect(net.damage).toBeUndefined()
      expect(net.damageType).toBeUndefined()
    }
    const blowgun = equipmentSchema.parse(BLOWGUN_STORED)
    if (blowgun.kind === 'weapon') {
      expect(blowgun.damage).toEqual({ flat: 1 })
    }
  })

  it('rejects damage/damageType mismatches and versatile rule violations', () => {
    expect(equipmentSchema.safeParse({ ...LONGSWORD_STORED, damageType: undefined }).success).toBe(
      false,
    )
    expect(equipmentSchema.safeParse({ ...NET_STORED, damageType: 'piercing' }).success).toBe(false)
    expect(
      equipmentSchema.safeParse({ ...LONGSWORD_STORED, versatileDamage: undefined }).success,
    ).toBe(false)
    expect(
      equipmentSchema.safeParse({
        ...SHORTBOW_STORED,
        versatileDamage: { count: 1, faces: 8 },
      }).success,
    ).toBe(false)
  })
})

describe('armor equipment variant', () => {
  it('parses light, medium, heavy armor and shields', () => {
    expect(equipmentSchema.parse(LEATHER_STORED)).toMatchObject({ baseAc: 11 })
    expect(equipmentSchema.parse(HALF_PLATE_STORED)).toMatchObject({ maxDexBonus: 2 })
    expect(equipmentSchema.parse(PLATE_STORED)).toMatchObject({ strengthRequirement: 15 })
    const shield = equipmentSchema.parse(SHIELD_WOOD_STORED)
    expect(shield.kind).toBe('armor')
    if (shield.kind === 'armor') {
      expect(shield.acBonus).toBe(2)
      expect(shield.baseAc).toBeUndefined()
    }
  })

  it('rejects body armor without baseAc and shields without acBonus', () => {
    const { baseAc: _b, ...noBase } = LEATHER_STORED as Record<string, unknown>
    expect(equipmentSchema.safeParse(noBase).success).toBe(false)
    const { acBonus: _a, ...noBonus } = SHIELD_WOOD_STORED as Record<string, unknown>
    expect(equipmentSchema.safeParse(noBonus).success).toBe(false)
  })
})

describe('tool equipment variant', () => {
  it('rejects tools missing utilizes or ability', () => {
    const { utilizes: _u, ...noUtilizes } = SAMPLE_BODIES.tool
    expect(equipmentSchema.safeParse(systemRecord('smiths-tools', noUtilizes)).success).toBe(false)
    const { ability: _a, ...noAbility } = SAMPLE_BODIES.tool
    expect(equipmentSchema.safeParse(systemRecord('smiths-tools', noAbility)).success).toBe(false)
  })
})

describe('tool display helpers', () => {
  it('formats utilize actions', () => {
    expect(formatToolUtilizeAction({ description: 'Identify a substance', dc: 15 })).toBe(
      'Identify a substance (DC 15)',
    )
    expect(
      formatToolUtilizes([
        { description: 'Pick a lock', dc: 15 },
        { description: 'Disarm a trap', dc: 15 },
      ]),
    ).toBe('Pick a lock (DC 15), or Disarm a trap (DC 15)')
  })
})

describe('getArmorAcDisplay', () => {
  const make = (overrides: Partial<ArmorBody>): Parameters<typeof getArmorAcDisplay>[0] => ({
    category: 'light',
    baseAc: 11,
    acBonus: undefined,
    addDexModifier: true,
    maxDexBonus: undefined,
    ...overrides,
  })

  it('formats light, medium, heavy, and shield AC strings', () => {
    expect(getArmorAcDisplay(make({ category: 'light', baseAc: 11 }))).toBe('11 + Dex')
    expect(getArmorAcDisplay(make({ category: 'medium', baseAc: 15, maxDexBonus: 2 }))).toBe(
      '15 + Dex (max 2)',
    )
    expect(getArmorAcDisplay(make({ category: 'heavy', baseAc: 18, addDexModifier: false }))).toBe(
      '18',
    )
    expect(getArmorAcDisplay(make({ category: 'shields', acBonus: 2 }))).toBe('+2')
  })
})

describe('weapon display helpers', () => {
  it('formats properties, range, and damage', () => {
    expect(formatWeaponProperties(['versatile', 'finesse'])).toBe('Versatile, Finesse')
    expect(formatWeaponProperties([])).toBe('—')
    expect(formatWeaponRange({ normal: 80, long: 320 })).toBe('80/320 ft.')
    expect(formatWeaponRange({ normal: 5 })).toBe('5 ft.')
    expect(formatWeaponDamage({ dice: { count: 2, faces: 6 } })).toBe('2d6')
    expect(formatWeaponDamage({ flat: 1 })).toBe('1')
  })

  it('computes average weapon damage', () => {
    expect(averageWeaponDamage({ dice: { count: 1, faces: 8 } })).toBe(4.5)
    expect(averageWeaponDamage({ flat: 1 })).toBe(1)
  })
})

describe('createEquipmentInputSchema', () => {
  it('requires a valid slug', () => {
    expect(
      createEquipmentInputSchema.safeParse({
        slug: 'torch',
        ...SAMPLE_BODIES.adventuring_gear,
      }).success,
    ).toBe(true)
    expect(createEquipmentInputSchema.safeParse(SAMPLE_BODIES.adventuring_gear).success).toBe(false)
    expect(
      createEquipmentInputSchema.safeParse({
        slug: 'Not A Slug',
        ...SAMPLE_BODIES.adventuring_gear,
      }).success,
    ).toBe(false)
  })

  it('accepts a valid weapon create payload', () => {
    expect(
      createEquipmentInputSchema.parse({ slug: 'longsword', ...LONGSWORD_BODY }),
    ).toMatchObject({ slug: 'longsword' })
  })

  it('rejects weight on service create payloads', () => {
    expect(
      createEquipmentInputSchema.safeParse({
        slug: 'skilled-hireling',
        ...SAMPLE_BODIES.service,
        weight: { value: 1, unit: 'lb' },
      }).success,
    ).toBe(false)
  })
})

describe('updateEquipmentInputSchema', () => {
  it('allows partial updates but still requires kind', () => {
    expect(
      updateEquipmentInputSchema.safeParse({
        kind: 'adventuring_gear',
        name: 'Bigger Torch',
      }).success,
    ).toBe(true)
    expect(updateEquipmentInputSchema.safeParse({ name: 'Bigger Torch' }).success).toBe(false)
  })

  it('rejects weight on service update payloads', () => {
    expect(
      updateEquipmentInputSchema.safeParse({
        kind: 'service',
        weight: { value: 1, unit: 'lb' },
      }).success,
    ).toBe(false)
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
      patch: { kind: 'adventuring_gear', cost: { amount: 2, currency: 'cp' } },
    }
    expect(equipmentPatchSchema.safeParse(valid).success).toBe(true)

    const { campaignId: _c, ...withoutCampaign } = valid
    expect(equipmentPatchSchema.safeParse(withoutCampaign).success).toBe(false)

    const { targetId: _t, ...withoutTarget } = valid
    expect(equipmentPatchSchema.safeParse(withoutTarget).success).toBe(false)
  })
})
