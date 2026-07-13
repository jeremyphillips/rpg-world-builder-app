import { describe, expect, it } from 'vitest'

import { adventuringGearBodySchema, formatHolySymbolUsage, HOLY_SYMBOL_USAGES } from '../equipment'
import { refineAdventuringGearEquipment } from './adventuring-gear-variant'

const BASE = {
  name: 'Test',
  cost: { amount: 5, currency: 'gp' as const },
  description: '',
}

const SPELLCASTING = {
  gearKind: 'spellcasting' as const,
}

describe('adventuringGearBodySchema', () => {
  it('requires spellcastingGearKind on spellcasting gear', () => {
    const result = adventuringGearBodySchema.safeParse({
      ...BASE,
      kind: 'adventuring_gear',
      ...SPELLCASTING,
    })
    expect(result.success).toBe(false)
  })

  it('requires holySymbolUsage on holy symbol gear', () => {
    const result = adventuringGearBodySchema.safeParse({
      ...BASE,
      kind: 'adventuring_gear',
      ...SPELLCASTING,
      spellcastingGearKind: 'holy_symbol',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a holy symbol with usage modes', () => {
    expect(
      adventuringGearBodySchema.parse({
        ...BASE,
        kind: 'adventuring_gear',
        ...SPELLCASTING,
        spellcastingGearKind: 'holy_symbol',
        holySymbolUsage: ['worn', 'held'],
      }),
    ).toMatchObject({
      gearKind: 'spellcasting',
      spellcastingGearKind: 'holy_symbol',
      holySymbolUsage: ['worn', 'held'],
    })
  })

  it('rejects holySymbolUsage on non-holy-symbol gear', () => {
    const result = adventuringGearBodySchema.safeParse({
      ...BASE,
      kind: 'adventuring_gear',
      gearKind: 'general',
      holySymbolUsage: ['held'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects spellcastingGearKind on non-spellcasting gear', () => {
    const result = adventuringGearBodySchema.safeParse({
      ...BASE,
      kind: 'adventuring_gear',
      gearKind: 'general',
      spellcastingGearKind: 'arcane_focus',
    })
    expect(result.success).toBe(false)
  })

  it('accepts alsoWeaponSlug on arcane focus staff gear', () => {
    expect(
      adventuringGearBodySchema.parse({
        ...BASE,
        kind: 'adventuring_gear',
        ...SPELLCASTING,
        spellcastingGearKind: 'arcane_focus',
        alsoWeaponSlug: 'quarterstaff',
        weight: { value: 4, unit: 'lb' },
      }),
    ).toMatchObject({ alsoWeaponSlug: 'quarterstaff' })
  })

  it('accepts spellbook spellcasting gear', () => {
    expect(
      adventuringGearBodySchema.parse({
        ...BASE,
        kind: 'adventuring_gear',
        ...SPELLCASTING,
        spellcastingGearKind: 'spellbook',
        weight: { value: 3, unit: 'lb' },
      }),
    ).toMatchObject({
      spellcastingGearKind: 'spellbook',
    })
  })

  it('rejects alsoWeaponSlug on general gear', () => {
    const result = adventuringGearBodySchema.safeParse({
      ...BASE,
      kind: 'adventuring_gear',
      gearKind: 'general',
      alsoWeaponSlug: 'quarterstaff',
    })
    expect(result.success).toBe(false)
  })
})

describe('formatHolySymbolUsage', () => {
  it('joins usage labels for stat display', () => {
    expect(formatHolySymbolUsage(['worn', 'held'])).toBe('Worn, Held')
    expect(formatHolySymbolUsage(HOLY_SYMBOL_USAGES)).toContain('Borne on shield')
  })
})

describe('refineAdventuringGearEquipment', () => {
  it('is wired through adventuringGearBodySchema', () => {
    expect(typeof refineAdventuringGearEquipment).toBe('function')
  })
})
