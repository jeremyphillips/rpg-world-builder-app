import { describe, expect, it } from 'vitest'

import {
  buildSpellEffectsCoverageInventory,
  spellSlugsNotProseOnly,
} from './spell-effects-coverage-inventory'
import { SRD_521_SPELL_SEED_EFFECTS, SRD_521_SPELL_SEED_EFFECT_SLUGS } from './spell-seed-effects'

const RULESET = 'srd-cc-5.2.1' as const

describe('spell effects coverage inventory (srd-cc-5.2.1)', () => {
  const inventory = buildSpellEffectsCoverageInventory(RULESET)

  it('covers all 92 seed spells', () => {
    expect(inventory.totalSpells).toBe(92)
    expect(inventory.entries).toHaveLength(92)
  })

  it('derives partially-modeled status for spells with structured effects', () => {
    expect(inventory.byStatus['partially-modeled'].sort()).toEqual(
      [...SRD_521_SPELL_SEED_EFFECT_SLUGS].sort(),
    )
    expect(inventory.byStatus['partially-modeled']).toHaveLength(24)
    expect(inventory.byStatus.modeled).toEqual([])
    expect(inventory.byStatus['prose-only']).toHaveLength(68)
    expect(spellSlugsNotProseOnly(inventory).sort()).toEqual(
      [...SRD_521_SPELL_SEED_EFFECT_SLUGS].sort(),
    )
  })

  it('reports structured effect counts from catalog seed data', () => {
    for (const entry of inventory.entries) {
      const expectedCount = SRD_521_SPELL_SEED_EFFECT_SLUGS.includes(
        entry.slug as (typeof SRD_521_SPELL_SEED_EFFECT_SLUGS)[number],
      )
        ? (SRD_521_SPELL_SEED_EFFECTS[entry.slug as keyof typeof SRD_521_SPELL_SEED_EFFECTS]
            ?.length ?? 0)
        : 0

      expect(entry.effectCount).toBe(expectedCount)
      expect(entry.status).toBe(expectedCount > 0 ? 'partially-modeled' : 'prose-only')
    }
  })
})
