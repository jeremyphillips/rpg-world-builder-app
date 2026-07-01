import { describe, expect, it } from 'vitest'

import {
  getStandardStartingWealth,
  getStandardStartingWealthRules,
  getStartingWealthBySlug,
  loadSeedStartingWealth,
  loadStartingWealthRulesSeed,
  seedStartingWealthSlugs,
} from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 starting wealth seed', () => {
  const tables = loadSeedStartingWealth(RULESET)

  it('ships exactly one standard starting wealth table', () => {
    expect(tables).toHaveLength(1)
    expect(tables[0]?.scope.kind).toBe('standard')
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const table of tables) {
      expect(table.id).toBe(`${RULESET}:${table.slug}`)
      expect(table.source).toBe('system')
      expect(table.campaignId).toBeNull()
      expect(table.rulesetId).toBe(RULESET)
    }
  })

  it('exposes lookup helpers', () => {
    expect(seedStartingWealthSlugs(RULESET).size).toBe(1)
    expect(getStartingWealthBySlug(RULESET, 'standard-starting-wealth').slug).toBe(
      'standard-starting-wealth',
    )
    expect(getStandardStartingWealth(RULESET).tiers).toHaveLength(5)
    expect(loadStartingWealthRulesSeed(RULESET)).toHaveLength(1)
    expect(getStandardStartingWealthRules(RULESET).name).toBe('Standard Starting Wealth')
    expect(getStandardStartingWealthRules(RULESET).tiers).toHaveLength(5)
  })

  it('ships contiguous non-overlapping tier ranges through level 20', () => {
    const tiers = getStandardStartingWealth(RULESET).tiers
    expect(tiers[0]).toMatchObject({ id: 'level-1', minLevel: 1, maxLevel: 1 })
    expect(tiers.at(-1)).toMatchObject({ id: 'levels-17-20', minLevel: 17, maxLevel: 20 })
  })
})
