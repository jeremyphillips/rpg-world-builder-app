import { describe, expect, it } from 'vitest'

import { equipmentModifierSchema } from './modifier'

describe('equipmentModifierSchema', () => {
  it('accepts a spellcasting focus modifier using spellcasting gear kind vocab', () => {
    expect(
      equipmentModifierSchema.parse({
        kind: 'spellcasting_focus',
        spellcastingGearKind: 'druidic_focus',
      }),
    ).toEqual({
      kind: 'spellcasting_focus',
      spellcastingGearKind: 'druidic_focus',
    })
  })

  it('rejects non-focus spellcasting gear kinds', () => {
    expect(
      equipmentModifierSchema.safeParse({
        kind: 'spellcasting_focus',
        spellcastingGearKind: 'spellbook',
      }).success,
    ).toBe(false)
  })

  it('rejects unknown gear kinds', () => {
    expect(
      equipmentModifierSchema.safeParse({
        kind: 'spellcasting_focus',
        spellcastingGearKind: 'general',
      }).success,
    ).toBe(false)
  })
})
