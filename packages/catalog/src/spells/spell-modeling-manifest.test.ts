import { validateSpellModelingPromotion } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from './index'
import {
  SRD_521_SPELL_MODELING_EDITOR_ELIGIBLE_SLUGS,
  SRD_521_SPELL_MODELING_MANIFEST,
  SRD_521_SPELL_MODELING_MANIFEST_SLUGS,
  type Srd521SpellModelingManifestSlug,
} from './spell-modeling-manifest'
import { SRD_521_SPELL_SEED_RESOLUTION_SLUGS } from './spell-seed-resolution'
import { validateSpellModelingConsistency } from './spell-modeling-audit'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD 5.2.1 spell modeling manifest', () => {
  it('covers every seed spell slug exactly once', () => {
    const seedSlugs = loadSeedSpells(RULESET)
      .map((spell) => spell.slug)
      .sort()
    const manifestSlugs = [...SRD_521_SPELL_MODELING_MANIFEST_SLUGS].sort()

    expect(manifestSlugs).toEqual(seedSlugs)
    expect(manifestSlugs).toHaveLength(92)
  })

  it('promotes every resolution seed to meaningful-partial', () => {
    expect(SRD_521_SPELL_MODELING_EDITOR_ELIGIBLE_SLUGS).toEqual(
      SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
    )

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      expect(SRD_521_SPELL_MODELING_MANIFEST[slug]?.status).toBe('meaningful-partial')
    }
  })

  it('matches modeling metadata on applied seeds', () => {
    for (const spell of loadSeedSpells(RULESET)) {
      expect(spell.modeling, spell.slug).toEqual(
        SRD_521_SPELL_MODELING_MANIFEST[spell.slug as Srd521SpellModelingManifestSlug],
      )
    }
  })

  it('passes promotion validation for every editor-eligible manifest entry', () => {
    for (const slug of SRD_521_SPELL_MODELING_EDITOR_ELIGIBLE_SLUGS) {
      const spell = loadSeedSpells(RULESET).find((entry) => entry.slug === slug)!
      const issues = validateSpellModelingPromotion(spell)
      expect(issues, slug).toEqual([])
    }
  })

  it('has no consistency violations on seeds after apply', () => {
    for (const spell of loadSeedSpells(RULESET)) {
      expect(validateSpellModelingConsistency(spell), spell.slug).toEqual([])
    }
  })
})
