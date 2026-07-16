import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from './index'
import { SRD_521_SPELL_SEED_EFFECTS, SRD_521_SPELL_SEED_EFFECT_SLUGS } from './spell-seed-effects'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD 5.2.1 spell seed effects manifest', () => {
  it('matches structured effects on every seeded spell', () => {
    const spells = loadSeedSpells(RULESET)

    for (const slug of SRD_521_SPELL_SEED_EFFECT_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)
      expect(spell?.effects, slug).toEqual(SRD_521_SPELL_SEED_EFFECTS[slug])
    }
  })

  it('leaves spells outside the manifest without structured effects', () => {
    const spells = loadSeedSpells(RULESET)
    const modeled = new Set(SRD_521_SPELL_SEED_EFFECT_SLUGS)

    for (const spell of spells) {
      if (modeled.has(spell.slug as (typeof SRD_521_SPELL_SEED_EFFECT_SLUGS)[number])) {
        expect(spell.effects?.length).toBeGreaterThan(0)
      } else {
        expect(spell.effects).toBeUndefined()
      }
    }
  })
})
