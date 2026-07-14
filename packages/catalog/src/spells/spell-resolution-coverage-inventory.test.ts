import { describe, expect, it } from 'vitest'

import {
  buildSpellResolutionCoverageInventory,
  spellSlugsDeferredResolution,
  SRD_521_SPELL_SEED_EFFECT_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
} from './spell-resolution-coverage-inventory'
import { SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS } from './spell-seed-resolution'

const RULESET = 'srd-cc-5.2.1' as const

describe('spell resolution coverage inventory (srd-cc-5.2.1)', () => {
  const inventory = buildSpellResolutionCoverageInventory(RULESET)
  const applicable = new Set<string>(SRD_521_SPELL_SEED_RESOLUTION_SLUGS)

  it('covers all 92 seed spells', () => {
    expect(inventory.totalSpells).toBe(92)
    expect(inventory.entries).toHaveLength(92)
  })

  it('reports 17 migrated single-effect resolution spells', () => {
    const tierA = SRD_521_SPELL_SEED_RESOLUTION_SLUGS.filter((slug) => slug !== 'eldritch-blast')
    expect(inventory.byStatus.migrated.sort()).toEqual([...tierA].sort())
    expect(inventory.byStatus.migrated).toHaveLength(17)
  })

  it('reports Eldritch Blast as hybrid', () => {
    expect(inventory.byStatus.hybrid).toEqual(['eldritch-blast'])
  })

  it('reports six deferred effect spells and 68 prose-only spells', () => {
    expect(inventory.byStatus.deferred).toHaveLength(6)
    expect(inventory.byStatus['prose-only']).toHaveLength(68)

    const deferredFromEffects = SRD_521_SPELL_SEED_EFFECT_SLUGS.filter(
      (slug) => !applicable.has(slug),
    )
    expect(inventory.byStatus.deferred.sort()).toEqual(deferredFromEffects.sort())
    expect(spellSlugsDeferredResolution(inventory).sort()).toEqual(
      [...deferredFromEffects, 'eldritch-blast'].sort(),
    )
  })

  it('groups manifest deferrals by documented reason codes', () => {
    expect(inventory.byDeferReason['automatic-method']).toEqual(['magic-missile'])
    expect(inventory.byDeferReason['extra-damage-rider']?.sort()).toEqual(['hex', 'hunters-mark'])
    expect(inventory.byDeferReason['multi-effect']).toEqual(['ice-knife'])
    expect(inventory.byDeferReason['choice-model']).toEqual(['arcane-hand'])
    expect(inventory.byDeferReason['placeholder-damage']).toEqual(['true-strike'])

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS) {
      const entry = inventory.entries.find((item) => item.slug === slug)
      expect(entry?.deferReason, slug).toBeDefined()
      expect(entry?.hasResolution).toBe(false)
    }
  })

  it('marks coverage entries consistently with the read model', () => {
    for (const entry of inventory.entries) {
      if (applicable.has(entry.slug)) {
        expect(entry.hasResolution).toBe(true)
        expect(['migrated', 'hybrid']).toContain(entry.status)
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
