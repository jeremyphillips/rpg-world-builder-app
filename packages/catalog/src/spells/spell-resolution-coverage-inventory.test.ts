import { describe, expect, it } from 'vitest'

import {
  buildSpellResolutionCoverageInventory,
  spellSlugsDeferredResolution,
  SRD_521_SPELL_SEED_EFFECT_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
} from './spell-resolution-coverage-inventory'

const RULESET = 'srd-cc-5.2.1' as const

describe('spell resolution coverage inventory (srd-cc-5.2.1)', () => {
  const inventory = buildSpellResolutionCoverageInventory(RULESET)
  const migrated = new Set<string>(SRD_521_SPELL_SEED_RESOLUTION_SLUGS)

  it('covers all 92 seed spells', () => {
    expect(inventory.totalSpells).toBe(92)
    expect(inventory.entries).toHaveLength(92)
  })

  it('reports 13 migrated Tier A spells', () => {
    expect(inventory.byStatus.migrated.sort()).toEqual(
      [...SRD_521_SPELL_SEED_RESOLUTION_SLUGS].sort(),
    )
    expect(inventory.byStatus.migrated).toHaveLength(13)
  })

  it('reports 11 deferred effect spells and 68 prose-only spells', () => {
    expect(inventory.byStatus.deferred).toHaveLength(11)
    expect(inventory.byStatus.hybrid).toEqual([])
    expect(inventory.byStatus['prose-only']).toHaveLength(68)

    const deferredFromEffects = SRD_521_SPELL_SEED_EFFECT_SLUGS.filter(
      (slug) => !migrated.has(slug),
    )
    expect(inventory.byStatus.deferred.sort()).toEqual(deferredFromEffects.sort())
    expect(spellSlugsDeferredResolution(inventory).sort()).toEqual(deferredFromEffects.sort())
  })

  it('marks migrated spells with resolution on the read model', () => {
    for (const entry of inventory.entries) {
      if (migrated.has(entry.slug)) {
        expect(entry.hasResolution).toBe(true)
        expect(entry.status).toBe('migrated')
      } else if (entry.effectCount > 0) {
        expect(entry.status).toBe('deferred')
        expect(entry.hasResolution).toBe(false)
      } else {
        expect(entry.status).toBe('prose-only')
        expect(entry.effectCount).toBe(0)
      }
    }
  })
})
