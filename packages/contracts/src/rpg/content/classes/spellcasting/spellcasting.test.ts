import { describe, expect, it } from 'vitest'

import { isSpellcastingActiveAtLevel, spellcastingSchema } from './spellcasting'

describe('spellcastingSchema', () => {
  it('parses slotProgressionId, profileId, and ability', () => {
    const parsed = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      profileId: 'srd:wizard',
      ability: 'int',
    })
    expect(parsed.slotProgressionId).toBe('full-caster')
    expect(parsed.profileId).toBe('srd:wizard')
    expect(parsed.ability).toBe('int')
    expect(parsed.level).toBe(1)
  })

  it('parses optional level and description', () => {
    const withLevel = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      profileId: 'srd:bard',
      level: 2,
      ability: 'cha',
      description: '<p>Delayed caster.</p>',
    })
    expect(withLevel.level).toBe(2)
    expect(withLevel.description).toBe('<p>Delayed caster.</p>')
  })

  it('parses optional focus kinds and rejects non-focus kinds', () => {
    const spellcasting = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      profileId: 'srd:wizard',
      ability: 'int',
      focusKinds: ['arcane_focus'],
    })
    expect(spellcasting.focusKinds).toEqual(['arcane_focus'])

    expect(
      spellcastingSchema.safeParse({
        slotProgressionId: 'full-caster',
        profileId: 'srd:wizard',
        ability: 'int',
        focusKinds: ['spellbook'],
      }).success,
    ).toBe(false)
  })

  it('parses required and recommended spellcasting gear', () => {
    const spellcasting = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      profileId: 'srd:wizard',
      ability: 'int',
      requiredGear: ['spellbook'],
      focusKinds: ['arcane_focus'],
      recommendedGear: ['spellbook'],
    })
    expect(spellcasting.requiredGear).toEqual(['spellbook'])
    expect(spellcasting.focusKinds).toEqual(['arcane_focus'])
    expect(spellcasting.recommendedGear).toEqual(['spellbook'])
  })

  it('strips legacy progression and preparation fields on parse', () => {
    const result = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      profileId: 'srd:wizard',
      ability: 'int',
      progression: 'full',
      preparation: 'prepared',
    })

    expect(result.profileId).toBe('srd:wizard')
    expect('progression' in result).toBe(false)
    expect('preparation' in result).toBe(false)
  })
})

describe('isSpellcastingActiveAtLevel', () => {
  it('respects unlock level', () => {
    const delayed = spellcastingSchema.parse({
      slotProgressionId: 'half-caster',
      profileId: 'srd:paladin',
      level: 2,
      ability: 'cha',
    })
    expect(isSpellcastingActiveAtLevel(delayed, 1)).toBe(false)
    expect(isSpellcastingActiveAtLevel(delayed, 2)).toBe(true)
  })
})
