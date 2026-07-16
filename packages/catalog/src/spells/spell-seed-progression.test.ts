import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from './index'
import {
  resolveSpellSeedProgression,
  SRD_521_SPELL_SEED_PROGRESSION,
  SRD_521_SPELL_SEED_PROGRESSION_SLUGS,
} from './spell-seed-progression'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD 5.2.1 spell seed progression manifest', () => {
  it('matches structured progression on every seeded spell', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_PROGRESSION_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)
      expect(spell?.resolution?.progression, slug).toEqual(SRD_521_SPELL_SEED_PROGRESSION[slug])
    }
  })

  it('resolves progression by slug', () => {
    expect(resolveSpellSeedProgression('fire-bolt')).toEqual(
      SRD_521_SPELL_SEED_PROGRESSION['fire-bolt'],
    )
    expect(resolveSpellSeedProgression('poison-spray')).toEqual(
      SRD_521_SPELL_SEED_PROGRESSION['poison-spray'],
    )
    expect(resolveSpellSeedProgression('chill-touch')).toEqual(
      SRD_521_SPELL_SEED_PROGRESSION['chill-touch'],
    )
    expect(resolveSpellSeedProgression('bless')).toBeUndefined()
  })
})
