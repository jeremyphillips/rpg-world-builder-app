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

  it('reports 19 migrated single-effect resolution spells', () => {
    const tierA = SRD_521_SPELL_SEED_RESOLUTION_SLUGS.filter(
      (slug) => slug !== 'ice-knife' && slug !== 'arcane-hand',
    )
    expect(inventory.byStatus.migrated.sort()).toEqual([...tierA].sort())
    expect(inventory.byStatus.migrated).toHaveLength(19)
  })

  it('reports Ice Knife and Arcane Hand as hybrid', () => {
    expect(inventory.byStatus.hybrid.sort()).toEqual(['arcane-hand', 'ice-knife'].sort())
  })

  it('reports ice-knife and arcane-hand with multi-effect resolution envelopes', () => {
    const iceKnife = inventory.entries.find((entry) => entry.slug === 'ice-knife')
    const arcaneHand = inventory.entries.find((entry) => entry.slug === 'arcane-hand')
    expect(iceKnife?.hasResolution).toBe(true)
    expect(arcaneHand?.hasResolution).toBe(true)
    expect(iceKnife?.effectCount).toBe(2)
    expect(arcaneHand?.effectCount).toBe(2)
  })

  it('reports three deferred effect spells and 68 prose-only spells', () => {
    expect(inventory.byStatus.deferred).toHaveLength(3)
    expect(inventory.byStatus['prose-only']).toHaveLength(68)

    const deferredFromEffects = SRD_521_SPELL_SEED_EFFECT_SLUGS.filter(
      (slug) => !applicable.has(slug),
    )
    expect(inventory.byStatus.deferred.sort()).toEqual(deferredFromEffects.sort())
    expect(spellSlugsDeferredResolution(inventory).sort()).toEqual(
      [...deferredFromEffects, 'ice-knife', 'arcane-hand'].sort(),
    )
  })

  it('groups manifest deferrals by documented reason codes', () => {
    expect(inventory.byDeferReason['automatic-method']).toBeUndefined()
    expect(inventory.byDeferReason['extra-damage-rider']?.sort()).toEqual(['hex', 'hunters-mark'])
    expect(inventory.byDeferReason['placeholder-damage']).toEqual(['true-strike'])
    expect(inventory.byDeferReason['multi-effect']).toBeUndefined()
    expect(inventory.byDeferReason['choice-model']).toBeUndefined()

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

  it('attaches targeting gap codes to hybrid spells with known partial modeling', () => {
    const eldritchBlast = inventory.entries.find((entry) => entry.slug === 'eldritch-blast')
    const iceKnife = inventory.entries.find((entry) => entry.slug === 'ice-knife')
    const arcaneHand = inventory.entries.find((entry) => entry.slug === 'arcane-hand')
    const fireball = inventory.entries.find((entry) => entry.slug === 'fireball')

    expect(eldritchBlast?.targetingGap).toBe('dynamic-target-count')
    expect(iceKnife?.targetingGap).toBe('chained-targets')
    expect(arcaneHand?.targetingGap).toBe('multi-mode-choice')
    expect(fireball?.targetingGap).toBeUndefined()
  })
})
