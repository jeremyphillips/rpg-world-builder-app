import { createSpellInputSchema, ELDRITCH_BLAST_RESOLUTION } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickSpell } from '../../../lib/fixtures/pick'
import { RESOLUTION_FORM_FIXTURES } from '../../resolution/fixtures'
import { SPELL_EFFECT_FIXTURES } from './effect-fixtures'
import {
  normalizeSpellEffects,
  spellEffectsFromFormValues,
  spellEffectsToFormValues,
} from './effect-form-values'
import { buildSpellCreateInput, spellToFormValues } from '../spell-form-values'
import type { SpellFormValues } from '../spell-form-fields'

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

describe('buildSpellCreateInput resolution mapping', () => {
  it('includes resolution in create input when populated in form values', () => {
    const spell = pickSpell('fire-bolt')
    const formValues = {
      ...spellToFormValues(spell),
      resolution: RESOLUTION_FORM_FIXTURES.eldritchBlast,
    } as SpellFormValues
    const input = buildSpellCreateInput(formValues)

    expect(input.resolution).toEqual(ELDRITCH_BLAST_RESOLUTION)
    expect(() => createSpellInputSchema.parse(input)).not.toThrow()
  })
})
