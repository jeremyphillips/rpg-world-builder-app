import { describe, expect, it } from 'vitest'
import { xpRequiredForLevel } from '@rpg/contracts'

import {
  getStandardXpProgression,
  getXpProgressionBySlug,
  loadSeedXpProgressions,
  seedXpProgressionSlugs,
} from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 XP progression seed', () => {
  const progressions = loadSeedXpProgressions(RULESET)

  it('ships one standard XP progression (validated against the schema at load)', () => {
    expect(progressions).toHaveLength(1)
    expect(progressions[0]?.scope).toEqual({ kind: 'standard' })
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const progression of progressions) {
      expect(progression.id).toBe(`${RULESET}:${progression.slug}`)
      expect(progression.source).toBe('system')
      expect(progression.campaignId).toBeNull()
      expect(progression.rulesetId).toBe(RULESET)
    }
  })

  it('has unique slugs', () => {
    const slugs = progressions.map((progression) => progression.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedXpProgressionSlugs(RULESET).size).toBe(1)
  })

  it('can load the standard progression directly', () => {
    const progression = getStandardXpProgression(RULESET)

    expect(progression.slug).toBe('standard-xp-progression')
    expect(getXpProgressionBySlug(RULESET, progression.slug)).toBe(progression)
  })

  it('stores SRD thresholds through level 20', () => {
    const progression = getStandardXpProgression(RULESET)

    expect(progression.entries).toHaveLength(20)
    expect(xpRequiredForLevel(progression, 1)).toBe(0)
    expect(xpRequiredForLevel(progression, 5)).toBe(6500)
    expect(xpRequiredForLevel(progression, 20)).toBe(355000)
  })
})
