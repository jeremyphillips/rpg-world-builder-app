import { CURE_WOUNDS_RESOLUTION, FALSE_LIFE_RESOLUTION } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from './index'
import {
  resolveSpellSeedResolution,
  SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_MANIFEST_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS,
} from './spell-seed-resolution'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD 5.2.1 spell seed resolution manifest', () => {
  it('matches structured resolution on every applicable seeded spell after apply', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)
      expect(spell?.resolution, slug).toEqual(resolveSpellSeedResolution(spell!))
    }
  })

  it('leaves spells outside the manifest without structured resolution', () => {
    const spells = loadSeedSpells(RULESET)
    const applicable = new Set(SRD_521_SPELL_SEED_RESOLUTION_SLUGS)

    for (const spell of spells) {
      if (applicable.has(spell.slug as (typeof SRD_521_SPELL_SEED_RESOLUTION_SLUGS)[number])) {
        expect(spell.resolution).toBeDefined()
      } else {
        expect(spell.resolution).toBeUndefined()
      }
    }
  })

  it('keeps effects[] on applicable migrated and hybrid spells', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)
      expect(spell?.effects?.length, slug).toBeGreaterThan(0)
    }
  })

  it('covers exactly 13 Tier A slugs', () => {
    expect(SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS).toHaveLength(13)
  })

  it('applies resolution to 18 slugs (13 Tier A + Eldritch Blast + 4 Tier D)', () => {
    expect(SRD_521_SPELL_SEED_RESOLUTION_SLUGS).toHaveLength(18)
    expect(SRD_521_SPELL_SEED_RESOLUTION_SLUGS).toContain('eldritch-blast')
    expect(SRD_521_SPELL_SEED_RESOLUTION_SLUGS).toContain('cure-wounds')
    expect(SRD_521_SPELL_SEED_RESOLUTION_SLUGS).toContain('false-life')
  })

  it('documents six explicit deferrals across Tier B/C/D', () => {
    expect(SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS.sort()).toEqual(
      ['arcane-hand', 'hex', 'hunters-mark', 'ice-knife', 'magic-missile', 'true-strike'].sort(),
    )
    expect(SRD_521_SPELL_SEED_RESOLUTION_MANIFEST_SLUGS).toHaveLength(24)
  })

  it('returns undefined for deferred manifest slugs', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)!
      expect(resolveSpellSeedResolution(spell)).toBeUndefined()
      expect(spell.resolution).toBeUndefined()
    }
  })

  it('derives Tier D healing and temporary hit point resolutions', () => {
    const cureWounds = loadSeedSpells(RULESET).find((entry) => entry.slug === 'cure-wounds')!
    const falseLife = loadSeedSpells(RULESET).find((entry) => entry.slug === 'false-life')!

    expect(cureWounds.resolution).toEqual(CURE_WOUNDS_RESOLUTION)
    expect(falseLife.resolution).toEqual(FALSE_LIFE_RESOLUTION)
  })
})
