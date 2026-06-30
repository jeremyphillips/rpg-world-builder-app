import { describe, expect, it } from 'vitest'

import { equipmentModifierSchema } from './modifier'

describe('equipmentModifierSchema', () => {
  it('accepts a spellcasting focus modifier using gear kind vocab', () => {
    expect(
      equipmentModifierSchema.parse({
        kind: 'spellcasting_focus',
        focusKind: 'druidic_focus',
      }),
    ).toEqual({
      kind: 'spellcasting_focus',
      focusKind: 'druidic_focus',
    })
  })

  it('rejects non-focus gear kinds', () => {
    expect(
      equipmentModifierSchema.safeParse({
        kind: 'spellcasting_focus',
        focusKind: 'general',
      }).success,
    ).toBe(false)
  })
})
