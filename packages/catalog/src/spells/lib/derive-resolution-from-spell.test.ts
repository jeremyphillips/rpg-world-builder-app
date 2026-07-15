import {
  ARCANE_HAND_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from '../index'
import {
  deriveAndValidateSpellResolution,
  deriveResolutionFromSpell,
  findPrimaryDamageEffect,
  findPrimaryResolutionEffect,
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
    expect(resolution.target!.proximity).toEqual({
      kind: 'distance',
      distance: { value: 120, unit: 'ft' },
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

  it('maps self-origin save spells to self selection with area', () => {
    const spell = spellBySlug('burning-hands')
    const resolution = deriveAndValidateSpellResolution(spell, {
      saveAbility: 'dex',
      selectionMode: 'self',
    })

    expect(resolution.selectionMode).toBe('self')
    expect(resolution.areaOfEffect).toEqual({
      shape: 'cone',
      length: { value: 15, unit: 'ft' },
    })
    expect(resolution.target).toBeUndefined()
    expect(resolution.method).toEqual({ kind: 'saving-throw', ability: 'dex' })
  })

  it('derives automatic healing resolution for cure wounds', () => {
    const spell = spellBySlug('cure-wounds')
    const resolution = deriveAndValidateSpellResolution(spell, {
      method: { kind: 'automatic' },
      target: { kind: 'creature' },
    })

    expect(resolution.method).toEqual({ kind: 'automatic' })
    expect(resolution.effects[0]).toMatchObject({
      kind: 'healing',
      roll: { dice: { count: 2, faces: 8 } },
    })
    expect(resolution.outcomes[0]?.result).toBe('applied')
  })

  it('derives automatic self temporary hit points for false life', () => {
    const spell = spellBySlug('false-life')
    const resolution = deriveAndValidateSpellResolution(spell, {
      method: { kind: 'automatic' },
      selectionMode: 'self',
    })

    expect(resolution.selectionMode).toBe('self')
    expect(resolution.target).toBeUndefined()
    expect(resolution.effects[0]?.kind).toBe('temporary-hit-points')
  })
})

describe('resolveSpellSeedResolution manifest parity', () => {
  it('matches contract fixtures for full entries', () => {
    expect(resolveSpellSeedResolution(spellBySlug('chill-touch'))).toEqual(CHILL_TOUCH_RESOLUTION)
    expect(resolveSpellSeedResolution(spellBySlug('inflict-wounds'))).toEqual(
      INFlict_WOUNDS_RESOLUTION,
    )
    expect(resolveSpellSeedResolution(spellBySlug('eldritch-blast'))).toEqual(
      ELDRITCH_BLAST_RESOLUTION,
    )
    expect(resolveSpellSeedResolution(spellBySlug('ice-knife'))).toEqual(ICE_KNIFE_RESOLUTION)
    expect(resolveSpellSeedResolution(spellBySlug('arcane-hand'))).toEqual(ARCANE_HAND_RESOLUTION)
  })

  it('derives every derived manifest slug with primary effect parity', () => {
    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const entry = SRD_521_SPELL_SEED_RESOLUTION[slug]
      if (entry.kind !== 'derived') continue

      const spell = spellBySlug(slug)
      const resolution = resolveSpellSeedResolution(spell)
      const primary = findPrimaryResolutionEffect(spell.effects)

      expect(resolution, slug).toBeDefined()
      expect(primary, slug).toBeDefined()

      const resolutionEffect = resolution!.effects[0]
      expect(resolutionEffect?.kind).toBe(primary?.kind)
      if (resolutionEffect?.kind === 'damage' && primary?.kind === 'damage') {
        expect(resolutionEffect.roll).toEqual(primary.roll)
        expect(resolutionEffect.damageType).toBe(primary.damageType)
      }
      if (resolutionEffect?.kind === 'healing' && primary?.kind === 'healing') {
        expect(resolutionEffect.roll).toEqual(primary.roll)
      }
      if (
        resolutionEffect?.kind === 'temporary-hit-points' &&
        primary?.kind === 'temporary-hit-points'
      ) {
        expect(resolutionEffect.roll).toEqual(primary.roll)
      }

      if (entry.kind === 'derived') {
        expect(deriveResolutionFromSpell(spell, entry.overrides)).toEqual(resolution)
      }
    }
  })
})
