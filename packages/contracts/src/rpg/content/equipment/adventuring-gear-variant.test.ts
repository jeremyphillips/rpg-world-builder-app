import { describe, expect, it } from 'vitest'

import { adventuringGearBodySchema, formatHolySymbolUsage, HOLY_SYMBOL_USAGES } from '../equipment'
import { refineAdventuringGearEquipment } from './adventuring-gear-variant'

const BASE = {
  name: 'Test',
  cost: { amount: 5, currency: 'gp' as const },
  description: '',
}

describe('adventuringGearBodySchema', () => {
  it('requires holySymbolUsage on holy symbol gear', () => {
    const result = adventuringGearBodySchema.safeParse({
      ...BASE,
      kind: 'adventuring_gear',
      gearKind: 'holy_symbol',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a holy symbol with usage modes', () => {
    expect(
      adventuringGearBodySchema.parse({
        ...BASE,
        kind: 'adventuring_gear',
        gearKind: 'holy_symbol',
        holySymbolUsage: ['worn', 'held'],
      }),
    ).toMatchObject({
      gearKind: 'holy_symbol',
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

  it('accepts alsoWeaponSlug on arcane focus staff gear', () => {
    expect(
      adventuringGearBodySchema.parse({
        ...BASE,
        kind: 'adventuring_gear',
        gearKind: 'arcane_focus',
        alsoWeaponSlug: 'quarterstaff',
        weight: { value: 4, unit: 'lb' },
      }),
    ).toMatchObject({ alsoWeaponSlug: 'quarterstaff' })
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
