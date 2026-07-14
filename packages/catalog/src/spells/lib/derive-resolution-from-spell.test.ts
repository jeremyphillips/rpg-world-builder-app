import {
  CHILL_TOUCH_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from '../index'
import {
  deriveAndValidateSpellResolution,
  deriveResolutionFromSpell,
  findPrimaryDamageEffect,
} from './derive-resolution-from-spell'
import {
  resolveSpellSeedResolution,
  SRD_521_SPELL_SEED_RESOLUTION,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
} from '../spell-seed-resolution'

const RULESET = 'srd-cc-5.2.1' as const

function spellBySlug(slug: string) {
  const spell = loadSeedSpells(RULESET).find((entry) => entry.slug === slug)
  if (!spell) throw new Error(`Missing seed spell: ${slug}`)
  return spell
}

describe('findPrimaryDamageEffect', () => {
  it('skips labeled extra-damage riders', () => {
    const hex = spellBySlug('hex')
    const primary = findPrimaryDamageEffect(hex.effects)
    expect(primary).toBeUndefined()
  })

  it('returns the first unlabeled damage effect', () => {
    const fireBolt = spellBySlug('fire-bolt')
    const primary = findPrimaryDamageEffect(fireBolt.effects)
    expect(primary?.damageType).toBe('fire')
    expect(primary?.roll).toEqual({ dice: { count: 1, faces: 10 } })
  })
})

describe('deriveResolutionFromSpell (Tier A)', () => {
  it('derives ranged attack resolution for fire bolt', () => {
    const spell = spellBySlug('fire-bolt')
    const resolution = deriveAndValidateSpellResolution(spell)

    expect(resolution.method).toEqual({ kind: 'attack', attackType: 'ranged-spell' })
    expect(resolution.range).toEqual({
      kind: 'distance',
      value: { value: 120, unit: 'ft' },
    })
    expect(resolution.outcomes).toEqual([
      {
        result: 'hit',
        applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
      },
    ])
  })

  it('derives DEX save resolution for acid splash', () => {
    const spell = spellBySlug('acid-splash')
    const resolution = deriveAndValidateSpellResolution(spell, { saveAbility: 'dex' })

    expect(resolution.method).toEqual({ kind: 'saving-throw', ability: 'dex' })
    expect(resolution.outcomes.map((outcome) => outcome.result)).toEqual([
      'failed-save',
      'successful-save',
    ])
  })

  it('maps self-origin save spells to reach when overridden', () => {
    const spell = spellBySlug('burning-hands')
    const resolution = deriveAndValidateSpellResolution(spell, {
      saveAbility: 'dex',
      range: { kind: 'reach' },
    })

    expect(resolution.range).toEqual({ kind: 'reach' })
    expect(resolution.method).toEqual({ kind: 'saving-throw', ability: 'dex' })
  })
})

describe('resolveSpellSeedResolution manifest parity', () => {
  it('matches contract fixtures for full entries', () => {
    expect(resolveSpellSeedResolution(spellBySlug('chill-touch'))).toEqual(CHILL_TOUCH_RESOLUTION)
    expect(resolveSpellSeedResolution(spellBySlug('inflict-wounds'))).toEqual(
      INFlict_WOUNDS_RESOLUTION,
    )
  })

  it('derives every Tier A manifest slug with primary damage parity', () => {
    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const spell = spellBySlug(slug)
      const resolution = resolveSpellSeedResolution(spell)
      const entry = SRD_521_SPELL_SEED_RESOLUTION[slug]
      const primary = findPrimaryDamageEffect(spell.effects)

      expect(resolution, slug).toBeDefined()
      expect(primary, slug).toBeDefined()

      const resolutionDamage = resolution!.effects[0]
      expect(resolutionDamage?.kind).toBe('damage')
      if (resolutionDamage?.kind === 'damage' && primary?.kind === 'damage') {
        expect(resolutionDamage.roll).toEqual(primary.roll)
        expect(resolutionDamage.damageType).toBe(primary.damageType)
      }

      if (entry.kind === 'derived') {
        expect(deriveResolutionFromSpell(spell, entry.overrides)).toEqual(resolution)
      }
    }
  })
})
