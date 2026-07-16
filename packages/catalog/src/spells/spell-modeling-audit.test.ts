import { describe, expect, it } from 'vitest'

import level0Raw from './data/srd-cc-5.2.1/level-0.json'
import level1Raw from './data/srd-cc-5.2.1/level-1.json'
import level2Raw from './data/srd-cc-5.2.1/level-2.json'
import level3Raw from './data/srd-cc-5.2.1/level-3.json'
import level4Raw from './data/srd-cc-5.2.1/level-4.json'
import level5Raw from './data/srd-cc-5.2.1/level-5.json'
import level6Raw from './data/srd-cc-5.2.1/level-6.json'
import level7Raw from './data/srd-cc-5.2.1/level-7.json'
import level8Raw from './data/srd-cc-5.2.1/level-8.json'
import level9Raw from './data/srd-cc-5.2.1/level-9.json'
import {
  buildSpellModelingAudit,
  generateSpellModelingReport,
  spellModelingAuditViolations,
} from './spell-modeling-audit'
import { CHILL_TOUCH_RESOLUTION } from '@rpg/contracts'

const RULESET = 'srd-cc-5.2.1' as const

describe('spell modeling audit (srd-cc-5.2.1)', () => {
  const audit = buildSpellModelingAudit(RULESET)

  it('covers all 92 seed spells', () => {
    expect(audit.totalSpells).toBe(92)
    expect(audit.entries).toHaveLength(92)
  })

  it('reports all spells as reviewed after manifest apply', () => {
    expect(audit.unreviewed).toEqual([])
  })

  it('promotes resolution seeds to meaningful-partial with editor eligibility', () => {
    const withResolution = audit.entries.filter((entry) => entry.hasResolution)
    expect(withResolution).toHaveLength(21)
    for (const entry of withResolution) {
      expect(entry.effectiveStatus).toBe('meaningful-partial')
      expect(entry.explicitStatus).toBe('meaningful-partial')
      expect(entry.editorEligible).toBe(true)
      expect(entry.displayReady).toBe(false)
    }
  })

  it('derives prose-only for reviewed spells without resolution', () => {
    const proseOnly = audit.entries.filter((entry) => !entry.hasResolution)
    expect(proseOnly).toHaveLength(71)
    for (const entry of proseOnly) {
      expect(entry.effectiveStatus).toBe('prose-only')
      expect(entry.explicitStatus).toBeUndefined()
      expect(entry.editorEligible).toBe(false)
    }
  })

  it('has no violations on the current seed catalog', () => {
    expect(spellModelingAuditViolations(audit)).toEqual([])
  })

  it('generates a markdown report with per-spell rows', () => {
    const report = generateSpellModelingReport(audit)
    expect(report).toContain('# Spell modeling inventory (generated)')
    expect(report).toContain('| Spell | Reviewed | Effective status |')
    expect(report).toContain('acid-splash')
  })

  it('reports no legacy root effects on parsed seeds', () => {
    expect(audit.entries.every((entry) => !entry.hasLegacyEffects)).toBe(true)
  })
})

describe('spell seed JSON invariants', () => {
  const levelRaws = [
    level0Raw,
    level1Raw,
    level2Raw,
    level3Raw,
    level4Raw,
    level5Raw,
    level6Raw,
    level7Raw,
    level8Raw,
    level9Raw,
  ] as const

  it('does not persist legacy root effects in level JSON files', () => {
    for (const spells of levelRaws) {
      for (const spell of spells as Array<Record<string, unknown>>) {
        expect(spell, String(spell.slug)).not.toHaveProperty('effects')
      }
    }
  })
})

describe('validateSpellModelingConsistency', () => {
  it('flags invalid gap codes and empty gaps arrays', async () => {
    const { validateSpellModelingConsistency } = await import('./spell-modeling-audit')
    const spell = {
      slug: 'test-spell',
      modeling: {
        reviewedAt: '2026-07-15T00:00:00.000Z',
        gaps: [],
      },
      resolution: CHILL_TOUCH_RESOLUTION,
    }

    const violations = validateSpellModelingConsistency(spell as never)
    expect(violations.some((v) => v.code === 'invalid-modeling-schema')).toBe(true)
  })
})
