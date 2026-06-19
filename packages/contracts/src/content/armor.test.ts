import { describe, expect, it } from 'vitest'

import {
  ARMOR_MATERIALS,
  getArmorAcDisplay,
  armorMaterialSchema,
  armorSchema,
  createArmorInputSchema,
  updateArmorInputSchema,
  armorPatchSchema,
} from './armor'
import type { ArmorBody } from './armor'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const LEATHER_STORED = {
  id: 'srd-cc-5.2.1:leather',
  slug: 'leather',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Leather',
  description: '',
  category: 'light' as const,
  cost: { amount: 10, currency: 'gp' as const },
  weight: { value: 10, unit: 'lb' as const },
  material: 'organic' as const,
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
}

const HALF_PLATE_STORED = {
  id: 'srd-cc-5.2.1:half-plate',
  slug: 'half-plate',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Half Plate',
  description: '',
  category: 'medium' as const,
  cost: { amount: 750, currency: 'gp' as const },
  weight: { value: 40, unit: 'lb' as const },
  material: 'metal' as const,
  baseAc: 15,
  addDexModifier: true,
  maxDexBonus: 2,
  stealthDisadvantage: true,
}

const PLATE_STORED = {
  id: 'srd-cc-5.2.1:plate',
  slug: 'plate',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Plate',
  description: '',
  category: 'heavy' as const,
  cost: { amount: 1500, currency: 'gp' as const },
  weight: { value: 65, unit: 'lb' as const },
  material: 'metal' as const,
  baseAc: 18,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 15,
}

const SHIELD_WOOD_STORED = {
  id: 'srd-cc-5.2.1:shield-wood',
  slug: 'shield-wood',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Shield (Wood)',
  description: '',
  category: 'shields' as const,
  cost: { amount: 10, currency: 'gp' as const },
  weight: { value: 6, unit: 'lb' as const },
  material: 'organic' as const,
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
}

// ---------------------------------------------------------------------------
// Enum schemas
// ---------------------------------------------------------------------------

describe('armorMaterialSchema', () => {
  it('accepts every known material', () => {
    for (const material of ARMOR_MATERIALS) {
      expect(armorMaterialSchema.parse(material)).toBe(material)
    }
  })

  it('rejects unknown materials', () => {
    expect(armorMaterialSchema.safeParse('cloth').success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getArmorAcDisplay
// ---------------------------------------------------------------------------

describe('getArmorAcDisplay', () => {
  const make = (overrides: Partial<ArmorBody>): Parameters<typeof getArmorAcDisplay>[0] => ({
    category: 'light',
    baseAc: 11,
    acBonus: undefined,
    addDexModifier: true,
    maxDexBonus: undefined,
    ...overrides,
  })

  it('light armor — full dex', () => {
    expect(getArmorAcDisplay(make({ category: 'light', baseAc: 11 }))).toBe('11 + Dex')
  })

  it('medium armor — capped dex', () => {
    expect(getArmorAcDisplay(make({ category: 'medium', baseAc: 15, maxDexBonus: 2 }))).toBe(
      '15 + Dex (max 2)',
    )
  })

  it('heavy armor — no dex', () => {
    expect(getArmorAcDisplay(make({ category: 'heavy', baseAc: 18, addDexModifier: false }))).toBe(
      '18',
    )
  })

  it('shield — ac bonus', () => {
    expect(getArmorAcDisplay(make({ category: 'shields', acBonus: 2 }))).toBe('+2')
  })
})

// ---------------------------------------------------------------------------
// armorSchema — stored shape
// ---------------------------------------------------------------------------

describe('armorSchema', () => {
  it('parses well-formed light armor', () => {
    expect(armorSchema.parse(LEATHER_STORED)).toMatchObject({ name: 'Leather', baseAc: 11 })
  })

  it('parses medium armor with maxDexBonus', () => {
    expect(armorSchema.parse(HALF_PLATE_STORED)).toMatchObject({ maxDexBonus: 2 })
  })

  it('parses heavy armor with strengthRequirement', () => {
    const result = armorSchema.parse(PLATE_STORED)
    expect(result.strengthRequirement).toBe(15)
    expect(result.addDexModifier).toBe(false)
  })

  it('parses a shield with acBonus and no baseAc', () => {
    const result = armorSchema.parse(SHIELD_WOOD_STORED)
    expect(result.acBonus).toBe(2)
    expect(result.baseAc).toBeUndefined()
  })

  it('rejects a non-shield without baseAc', () => {
    const { baseAc: _b, ...bad } = LEATHER_STORED
    expect(armorSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a shield without acBonus', () => {
    const { acBonus: _a, ...bad } = SHIELD_WOOD_STORED
    expect(armorSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a missing name', () => {
    const { name: _n, ...bad } = LEATHER_STORED
    expect(armorSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an unknown category', () => {
    const bad = { ...LEATHER_STORED, category: 'mythril' }
    expect(armorSchema.safeParse(bad).success).toBe(false)
  })

  it('parses a homebrew armor record', () => {
    const homebrew = {
      ...LEATHER_STORED,
      id: 'abc123',
      source: 'homebrew' as const,
      campaignId: 'campaign-xyz',
    }
    expect(armorSchema.parse(homebrew)).toMatchObject({ source: 'homebrew' })
  })
})

// ---------------------------------------------------------------------------
// Authoring DTOs
// ---------------------------------------------------------------------------

describe('createArmorInputSchema', () => {
  it('accepts a valid create payload', () => {
    const {
      id: _i,
      slug: _s,
      rulesetId: _r,
      source: _so,
      campaignId: _c,
      createdAt: _ca,
      updatedAt: _u,
      ...body
    } = LEATHER_STORED
    const input = { ...body, slug: 'leather' }
    expect(createArmorInputSchema.parse(input)).toMatchObject({ slug: 'leather' })
  })

  it('rejects an invalid slug', () => {
    const {
      id: _i,
      slug: _s,
      rulesetId: _r,
      source: _so,
      campaignId: _c,
      createdAt: _ca,
      updatedAt: _u,
      ...body
    } = LEATHER_STORED
    const input = { ...body, slug: 'Leather Armor!' }
    expect(createArmorInputSchema.safeParse(input).success).toBe(false)
  })
})

describe('updateArmorInputSchema', () => {
  it('accepts a partial update (name only)', () => {
    expect(updateArmorInputSchema.parse({ name: 'Leather +1' })).toMatchObject({
      name: 'Leather +1',
    })
  })
})

describe('armorPatchSchema', () => {
  it('accepts a minimal system patch', () => {
    const patch = {
      id: 'patch-1',
      campaignId: 'campaign-xyz',
      targetId: LEATHER_STORED.id,
      createdAt: '2024-05-21T00:00:00.000Z',
      updatedAt: '2024-05-21T00:00:00.000Z',
      patch: { name: 'Leather (Patched)' },
    }
    expect(armorPatchSchema.parse(patch)).toMatchObject({ patch: { name: 'Leather (Patched)' } })
  })
})
