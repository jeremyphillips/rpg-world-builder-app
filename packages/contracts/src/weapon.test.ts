import { describe, expect, it } from 'vitest'
import {
  WEAPON_CATEGORIES,
  WEAPON_MASTERIES,
  WEAPON_PROPERTIES,
  formatWeaponDamage,
  weaponCategorySchema,
  weaponMasterySchema,
  weaponPropertySchema,
  weaponSchema,
  createWeaponInputSchema,
  updateWeaponInputSchema,
  weaponPatchSchema,
} from './weapon'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const LONGSWORD_BASE = {
  name: 'Longsword',
  description: '',
  category: 'martial' as const,
  mode: 'melee' as const,
  cost: { amount: 15, currency: 'gp' as const },
  weight: { value: 3, unit: 'lb' as const },
  damage: { kind: 'dice' as const, count: 1, faces: 8 as const },
  damageType: 'slashing' as const,
  versatileDamage: { kind: 'dice' as const, count: 1, faces: 10 as const },
  properties: ['versatile' as const],
  mastery: 'sap' as const,
}

const LONGSWORD_STORED = {
  ...LONGSWORD_BASE,
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
}

const SHORTBOW_STORED = {
  id: 'srd-cc-5.2.1:shortbow',
  slug: 'shortbow',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Shortbow',
  description: '',
  category: 'simple' as const,
  mode: 'ranged' as const,
  cost: { amount: 25, currency: 'gp' as const },
  weight: { value: 2, unit: 'lb' as const },
  damage: { kind: 'dice' as const, count: 1, faces: 6 as const },
  damageType: 'piercing' as const,
  properties: ['ammunition' as const, 'two-handed' as const],
  mastery: 'vex' as const,
  range: { normal: 80, long: 320 },
}

const NET_STORED = {
  id: 'srd-cc-5.2.1:net',
  slug: 'net',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Net',
  description: '',
  category: 'martial' as const,
  mode: 'ranged' as const,
  cost: { amount: 1, currency: 'gp' as const },
  weight: { value: 3, unit: 'lb' as const },
  properties: ['special' as const, 'thrown' as const],
  mastery: 'topple' as const,
  range: { normal: 5, long: 15 },
  specialRules: 'A Large or smaller creature hit is Restrained until freed. Escape DC 10.',
}

const BLOWGUN_STORED = {
  id: 'srd-cc-5.2.1:blowgun',
  slug: 'blowgun',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Blowgun',
  description: '',
  category: 'martial' as const,
  mode: 'ranged' as const,
  cost: { amount: 10, currency: 'gp' as const },
  weight: { value: 1, unit: 'lb' as const },
  damage: { kind: 'flat' as const, amount: 1 },
  damageType: 'piercing' as const,
  properties: ['ammunition' as const, 'loading' as const],
  mastery: 'vex' as const,
  range: { normal: 25, long: 100 },
}

// ---------------------------------------------------------------------------
// Enum schemas
// ---------------------------------------------------------------------------

describe('weaponCategorySchema', () => {
  it('accepts every known weapon category', () => {
    for (const category of WEAPON_CATEGORIES) {
      expect(weaponCategorySchema.parse(category)).toBe(category)
    }
  })

  it('rejects unknown categories', () => {
    expect(weaponCategorySchema.safeParse('exotic').success).toBe(false)
  })
})

describe('weaponMasterySchema', () => {
  it('accepts every known mastery', () => {
    for (const mastery of WEAPON_MASTERIES) {
      expect(weaponMasterySchema.parse(mastery)).toBe(mastery)
    }
  })

  it('rejects unknown masteries', () => {
    expect(weaponMasterySchema.safeParse('parry').success).toBe(false)
  })
})

describe('weaponPropertySchema', () => {
  it('accepts every known property', () => {
    for (const prop of WEAPON_PROPERTIES) {
      expect(weaponPropertySchema.parse(prop)).toBe(prop)
    }
  })

  it('rejects unknown properties', () => {
    expect(weaponPropertySchema.safeParse('silent').success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// formatWeaponDamage
// ---------------------------------------------------------------------------

describe('formatWeaponDamage', () => {
  it('formats dice damage', () => {
    expect(formatWeaponDamage({ kind: 'dice', count: 2, faces: 6 })).toBe('2d6')
  })

  it('formats flat damage', () => {
    expect(formatWeaponDamage({ kind: 'flat', amount: 1 })).toBe('1')
  })
})

// ---------------------------------------------------------------------------
// weaponSchema — stored shape
// ---------------------------------------------------------------------------

describe('weaponSchema', () => {
  it('parses a well-formed melee weapon', () => {
    expect(weaponSchema.parse(LONGSWORD_STORED)).toMatchObject({ name: 'Longsword' })
  })

  it('parses a well-formed ranged weapon with range', () => {
    expect(weaponSchema.parse(SHORTBOW_STORED)).toMatchObject({ range: { normal: 80 } })
  })

  it('parses a net with no damage or damageType', () => {
    const result = weaponSchema.parse(NET_STORED)
    expect(result.damage).toBeUndefined()
    expect(result.damageType).toBeUndefined()
  })

  it('parses a blowgun with flat damage', () => {
    const result = weaponSchema.parse(BLOWGUN_STORED)
    expect(result.damage).toEqual({ kind: 'flat', amount: 1 })
  })

  it('rejects a weapon with damage but no damageType', () => {
    const bad = { ...LONGSWORD_STORED, damageType: undefined }
    expect(weaponSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a weapon with damageType but no damage', () => {
    const bad = { ...NET_STORED, damageType: 'piercing' }
    expect(weaponSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects versatile property without versatileDamage', () => {
    const bad = { ...LONGSWORD_STORED, versatileDamage: undefined }
    expect(weaponSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects versatileDamage without versatile property', () => {
    const bad = {
      ...SHORTBOW_STORED,
      versatileDamage: { kind: 'dice' as const, count: 1, faces: 8 as const },
    }
    expect(weaponSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a missing name', () => {
    const { name: _n, ...bad } = LONGSWORD_STORED
    expect(weaponSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a missing category', () => {
    const { category: _c, ...bad } = LONGSWORD_STORED
    expect(weaponSchema.safeParse(bad).success).toBe(false)
  })

  it('parses a homebrew weapon record', () => {
    const homebrew = {
      ...LONGSWORD_STORED,
      id: 'abc123',
      source: 'homebrew' as const,
      campaignId: 'campaign-xyz',
    }
    expect(weaponSchema.parse(homebrew)).toMatchObject({ source: 'homebrew' })
  })
})

// ---------------------------------------------------------------------------
// Authoring DTOs
// ---------------------------------------------------------------------------

describe('createWeaponInputSchema', () => {
  it('accepts a valid create payload', () => {
    const input = { ...LONGSWORD_BASE, slug: 'longsword' }
    expect(createWeaponInputSchema.parse(input)).toMatchObject({ slug: 'longsword' })
  })

  it('rejects an invalid slug', () => {
    const input = { ...LONGSWORD_BASE, slug: 'Long Sword!' }
    expect(createWeaponInputSchema.safeParse(input).success).toBe(false)
  })
})

describe('updateWeaponInputSchema', () => {
  it('accepts a partial update (name only)', () => {
    expect(updateWeaponInputSchema.parse({ name: 'Longsword +1' })).toMatchObject({
      name: 'Longsword +1',
    })
  })
})

describe('weaponPatchSchema', () => {
  it('accepts a minimal system patch', () => {
    const patch = {
      id: 'patch-1',
      campaignId: 'campaign-xyz',
      targetId: LONGSWORD_STORED.id,
      createdAt: '2024-05-21T00:00:00.000Z',
      updatedAt: '2024-05-21T00:00:00.000Z',
      patch: { name: 'Longsword (Patched)' },
    }
    expect(weaponPatchSchema.parse(patch)).toMatchObject({ patch: { name: 'Longsword (Patched)' } })
  })
})
