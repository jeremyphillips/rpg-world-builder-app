import { describe, expect, it } from 'vitest'

import {
  buildSpellEffectsCoverageInventory,
  spellSlugsNotProseOnly,
} from './spell-effects-coverage-inventory'

const RULESET = 'srd-cc-5.2.1' as const

describe('spell effects coverage inventory (srd-cc-5.2.1)', () => {
  const inventory = buildSpellEffectsCoverageInventory(RULESET)

  it('covers all 92 seed spells', () => {
    expect(inventory.totalSpells).toBe(92)
    expect(inventory.entries).toHaveLength(92)
  })

  it('derives prose-only status for every seed spell', () => {
    expect(inventory.byStatus['prose-only']).toHaveLength(92)
    expect(inventory.byStatus['partially-modeled']).toEqual([])
    expect(inventory.byStatus.modeled).toEqual([])
    expect(spellSlugsNotProseOnly(inventory)).toEqual([])
  })

  it('reports zero structured effects in catalog seed data', () => {
    for (const entry of inventory.entries) {
      expect(entry.effectCount).toBe(0)
      expect(entry.status).toBe('prose-only')
    }
  })
})
