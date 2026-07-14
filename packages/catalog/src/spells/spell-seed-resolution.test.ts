import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from './index'
import {
  resolveSpellSeedResolution,
  SRD_521_SPELL_SEED_RESOLUTION,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
} from './spell-seed-resolution'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD 5.2.1 spell seed resolution manifest', () => {
  it('matches structured resolution on every seeded spell after apply', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)
      expect(spell?.resolution, slug).toEqual(resolveSpellSeedResolution(spell!))
    }
  })

  it('leaves spells outside the manifest without structured resolution', () => {
    const spells = loadSeedSpells(RULESET)
    const migrated = new Set(SRD_521_SPELL_SEED_RESOLUTION_SLUGS)

    for (const spell of spells) {
      if (migrated.has(spell.slug as (typeof SRD_521_SPELL_SEED_RESOLUTION_SLUGS)[number])) {
        expect(spell.resolution).toBeDefined()
      } else {
        expect(spell.resolution).toBeUndefined()
      }
    }
  })

  it('keeps effects[] on migrated spells', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)
      expect(spell?.effects?.length, slug).toBeGreaterThan(0)
    }
  })

  it('covers exactly 13 Tier A slugs', () => {
    expect(SRD_521_SPELL_SEED_RESOLUTION_SLUGS).toHaveLength(13)
    expect(Object.keys(SRD_521_SPELL_SEED_RESOLUTION)).toHaveLength(13)
  })
})
