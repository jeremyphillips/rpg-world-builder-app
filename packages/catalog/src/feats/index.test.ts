import { describe, expect, it } from 'vitest'
import { formatRequirementExpression } from '@rpg/contracts'

import { loadSeedFeats, seedFeatSlugs } from './index'

const RULESET = 'srd-cc-5.2.1'

function featBySlug(slug: string) {
  const feat = loadSeedFeats(RULESET).find((entry) => entry.slug === slug)
  if (!feat) throw new Error(`Expected feat not found: ${slug}`)
  return feat
}

describe('SRD 5.2.1 feat seed', () => {
  const feats = loadSeedFeats(RULESET)

  it('ships all 17 SRD feats (validated against the schema at load)', () => {
    expect(feats).toHaveLength(17)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const feat of feats) {
      expect(feat.id).toBe(`${RULESET}:${feat.slug}`)
      expect(feat.source).toBe('system')
      expect(feat.campaignId).toBeNull()
      expect(feat.rulesetId).toBe(RULESET)
    }
  })

  it('has unique slugs', () => {
    const slugs = feats.map((f) => f.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedFeatSlugs(RULESET).size).toBe(17)
  })

  it('covers all four feat categories', () => {
    const categories = new Set(feats.map((f) => f.category))
    expect(categories).toEqual(new Set(['origin', 'general', 'fighting-style', 'epic-boon']))
  })

  it('marks exactly three feats as repeatable', () => {
    const repeatable = feats.filter((f) => f.repeatable.allowed)
    expect(repeatable.map((f) => f.slug).sort()).toEqual([
      'ability-score-improvement',
      'magic-initiate',
      'skilled',
    ])
  })

  describe('prerequisite trees', () => {
    it('omits prerequisites on origin feats without requirements', () => {
      for (const slug of ['alert', 'magic-initiate', 'savage-attacker', 'skilled']) {
        expect(featBySlug(slug).prerequisite).toBeUndefined()
      }
    })

    it('stores Ability Score Improvement as minLevel 4', () => {
      expect(featBySlug('ability-score-improvement').prerequisite).toEqual({
        kind: 'minLevel',
        level: 4,
      })
    })

    it('stores Grappler as level 4 AND (Str 13+ OR Dex 13+)', () => {
      const grappler = featBySlug('grappler')
      expect(formatRequirementExpression(grappler.prerequisite!)).toBe(
        'Level 4+, Strength or Dexterity 13+',
      )
    })

    it('omits prerequisites on fighting-style feats (eligibility from featChoice grants)', () => {
      for (const slug of ['archery', 'defense', 'great-weapon-fighting', 'two-weapon-fighting']) {
        expect(featBySlug(slug).prerequisite).toBeUndefined()
      }
    })

    it('stores epic boons as level 19 except Spell Recall', () => {
      const level19Only = [
        'boon-of-combat-prowess',
        'boon-of-dimensional-travel',
        'boon-of-fate',
        'boon-of-irresistible-offense',
        'boon-of-the-night-spirit',
        'boon-of-truesight',
      ]
      for (const slug of level19Only) {
        expect(featBySlug(slug).prerequisite).toEqual({ kind: 'minLevel', level: 19 })
      }
    })

    it('stores Boon of Spell Recall as level 19 AND spellcasting', () => {
      expect(featBySlug('boon-of-spell-recall').prerequisite).toEqual({
        kind: 'all',
        requirements: [{ kind: 'minLevel', level: 19 }, { kind: 'spellcasting' }],
      })
      expect(formatRequirementExpression(featBySlug('boon-of-spell-recall').prerequisite!)).toBe(
        'Level 19+, Spellcasting Feature',
      )
    })
  })
})
