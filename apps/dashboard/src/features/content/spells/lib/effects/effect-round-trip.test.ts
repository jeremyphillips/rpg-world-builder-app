import { createSpellInputSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickSpell } from '../../../lib/fixtures/pick'
import { SPELL_EFFECT_FIXTURES } from './effect-fixtures'
import {
  normalizeSpellEffects,
  spellEffectsFromFormValues,
  spellEffectsToFormValues,
} from './effect-form-values'
import { buildSpellCreateInput, spellToFormValues } from '../spell-form-values'

describe('spell effect round trips', () => {
  for (const [fixtureName, effects] of Object.entries(SPELL_EFFECT_FIXTURES)) {
    it(`${fixtureName}: contract effects → form values → normalize → contract`, () => {
      const formRows = spellEffectsToFormValues([...effects])
      const normalized = normalizeSpellEffects(formRows)
      expect(normalized).toEqual(effects)
      expect(spellEffectsFromFormValues(formRows)).toEqual(effects)
    })
  }
})

describe('buildSpellCreateInput persistence boundary', () => {
  it('omits resolution from create input even when populated in form values', () => {
    const spell = pickSpell('fire-bolt')
    const input = buildSpellCreateInput(spellToFormValues(spell))

    expect('resolution' in input).toBe(false)
    expect(() => createSpellInputSchema.parse(input)).not.toThrow()
  })
})
