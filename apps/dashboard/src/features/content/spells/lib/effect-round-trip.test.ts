import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createSpellInputSchema, type Spell, type SpellAtomicEffect } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickSpell } from '../../lib/fixtures/pick'
import { SPELL_EFFECT_DISPLAY_EXPECTATIONS, SPELL_EFFECT_FIXTURES } from './effect-fixtures'
import {
  normalizeSpellEffects,
  spellEffectsFromFormValues,
  spellEffectsToFormValues,
} from './effect-form-values'
import { buildSpellDetailViewModel } from './spell-display'
import { buildSpellCreateInput, spellToFormValues } from './spell-form-values'

const spellFormValuesPath = join(dirname(fileURLToPath(import.meta.url)), 'spell-form-values.ts')

function spellWithEffects(slug: string, effects: readonly SpellAtomicEffect[]): Spell {
  return { ...pickSpell(slug), effects: [...effects] }
}

describe('spell effect round trips', () => {
  for (const [fixtureName, effects] of Object.entries(SPELL_EFFECT_FIXTURES)) {
    it(`${fixtureName}: contract effects → form values → normalize → contract`, () => {
      const formRows = spellEffectsToFormValues([...effects])
      const normalized = normalizeSpellEffects(formRows)
      expect(normalized).toEqual(effects)
      expect(spellEffectsFromFormValues(formRows)).toEqual(effects)
    })
  }

  it('fire-bolt: spellToFormValues preserves effects on the read model', () => {
    const spell = spellWithEffects('fire-bolt', SPELL_EFFECT_FIXTURES.fireBolt)
    const formValues = spellToFormValues(spell)
    expect(spellEffectsFromFormValues(formValues.effects)).toEqual(SPELL_EFFECT_FIXTURES.fireBolt)
  })

  it('fireball: preserves area geometry while round-tripping effects', () => {
    const spell = spellWithEffects('fireball', SPELL_EFFECT_FIXTURES.fireball)
    const formValues = spellToFormValues(spell)
    expect(formValues.areaOfEffect?.shape).toBe('sphere')
    expect(spellEffectsFromFormValues(formValues.effects)).toEqual(SPELL_EFFECT_FIXTURES.fireball)
  })
})

describe('spell effect display expectations', () => {
  for (const [fixtureName, effects] of Object.entries(SPELL_EFFECT_FIXTURES)) {
    it(`${fixtureName}: buildSpellDetailViewModel effects section`, () => {
      const slugByFixture: Record<keyof typeof SPELL_EFFECT_FIXTURES, string> = {
        fireBolt: 'fire-bolt',
        fireball: 'fireball',
        cureWounds: 'cure-wounds',
        falseLife: 'false-life',
        magicMissile: 'magic-missile',
      }
      const spell = spellWithEffects(
        slugByFixture[fixtureName as keyof typeof SPELL_EFFECT_FIXTURES],
        effects,
      )
      const viewModel = buildSpellDetailViewModel(spell)

      expect(viewModel.effectsSection?.lines).toEqual(
        SPELL_EFFECT_DISPLAY_EXPECTATIONS[fixtureName as keyof typeof SPELL_EFFECT_FIXTURES],
      )
    })
  }

  it('magic-missile: does not imply per-projectile damage in preview lines', () => {
    const spell = spellWithEffects('magic-missile', SPELL_EFFECT_FIXTURES.magicMissile)
    const lines = buildSpellDetailViewModel(spell).effectsSection?.lines ?? []

    expect(lines).toEqual(SPELL_EFFECT_DISPLAY_EXPECTATIONS.magicMissile)
    expect(lines.join(' ')).not.toContain('per dart')
    expect(lines.join(' ')).not.toContain('per projectile')
  })
})

describe('buildSpellCreateInput persistence boundary', () => {
  it('omits effects from create input even when populated', () => {
    const spell = spellWithEffects('fire-bolt', SPELL_EFFECT_FIXTURES.fireBolt)
    const formValues = spellToFormValues(spell)
    const input = buildSpellCreateInput(formValues)

    expect('effects' in input).toBe(false)
    expect(() => createSpellInputSchema.parse(input)).not.toThrow()
  })

  it('documents persistence boundary with TODO(spell.effect.persistence)', () => {
    const source = readFileSync(spellFormValuesPath, 'utf8')
    expect(source).toContain('TODO(spell.effect.persistence)')
  })
})
