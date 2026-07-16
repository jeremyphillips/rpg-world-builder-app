import { describe, expect, it } from 'vitest'

import level0AFRaw from './data/srd-cc-5.2.1/level-0-a-f.json'
import level0GMRaw from './data/srd-cc-5.2.1/level-0-g-m.json'
import level0PTRaw from './data/srd-cc-5.2.1/level-0-p-t.json'
import level1AFRaw from './data/srd-cc-5.2.1/level-1-a-f.json'
import level1FIRaw from './data/srd-cc-5.2.1/level-1-f-i.json'
import level1IPRaw from './data/srd-cc-5.2.1/level-1-i-p.json'
import level1RTRaw from './data/srd-cc-5.2.1/level-1-r-t.json'
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

  it('reports prose-only spells missing documented blocker', () => {
    expect(audit.proseOnlyWithoutDocumentedBlocker.length).toBe(10)
    for (const slug of audit.proseOnlyWithoutDocumentedBlocker) {
      const entry = audit.entries.find((item) => item.slug === slug)!
      expect(entry.effectiveStatus).toBe('prose-only')
      expect(entry.blocker).toBeUndefined()
    }
  })

  it('documents blockers on all level-0 prose-only spells', () => {
    const level0ProseOnly = audit.entries.filter(
      (entry) =>
        entry.effectiveStatus === 'prose-only' &&
        [
          'dancing-lights',
          'druidcraft',
          'elementalism',
          'guidance',
          'light',
          'mage-hand',
          'mending',
          'message',
          'minor-illusion',
          'prestidigitation',
          'resistance',
          'spare-the-dying',
          'thaumaturgy',
          'true-strike',
        ].includes(entry.slug),
    )
    expect(level0ProseOnly).toHaveLength(14)
    for (const entry of level0ProseOnly) {
      expect(entry.blocker, entry.slug).toBeDefined()
      expect(entry.blockedFrom).toBe('meaningful-partial')
    }
  })

  it('documents blockers on all level-1 prose-only spells', () => {
    const level1ProseOnly = audit.entries.filter(
      (entry) =>
        entry.effectiveStatus === 'prose-only' &&
        [
          'bless',
          'create-or-destroy-water',
          'detect-evil-and-good',
          'detect-magic',
          'detect-poison-and-disease',
          'expeditious-retreat',
          'faerie-fire',
          'feather-fall',
          'fog-cloud',
          'hex',
          'hideous-laughter',
          'hunters-mark',
          'identify',
          'illusory-script',
          'jump',
          'longstrider',
          'mage-armor',
          'purify-food-and-drink',
          'sanctuary',
          'shield',
          'shield-of-faith',
          'silent-image',
          'sleep',
          'speak-with-animals',
        ].includes(entry.slug),
    )
    expect(level1ProseOnly).toHaveLength(24)
    for (const entry of level1ProseOnly) {
      expect(entry.blocker, entry.slug).toBeDefined()
      expect(entry.blockedFrom).toBe('meaningful-partial')
    }
  })

  it('documents blockers on all level 2-5 prose-only spells', () => {
    const level2to5ProseOnly = audit.entries.filter(
      (entry) =>
        entry.effectiveStatus === 'prose-only' &&
        [
          'aid',
          'darkness',
          'dragons-breath',
          'lesser-restoration',
          'levitate',
          'misty-step',
          'pass-without-trace',
          'ray-of-enfeeblement',
          'animate-dead',
          'bestow-curse',
          'counterspell',
          'dispel-magic',
          'glyph-of-warding',
          'revivify',
          'aura-of-life',
          'death-ward',
          'polymorph',
          'animate-objects',
          'greater-restoration',
          'planar-binding',
          'reincarnate',
          'summon-dragon',
          'telekinesis',
        ].includes(entry.slug),
    )
    expect(level2to5ProseOnly).toHaveLength(23)
    for (const entry of level2to5ProseOnly) {
      expect(entry.blocker, entry.slug).toBeDefined()
      expect(entry.blockedFrom).toBe('meaningful-partial')
    }
  })

  it('includes prose-only blocker coverage in generated report', () => {
    const report = generateSpellModelingReport(audit)
    expect(report).toContain(
      `Prose-only without documented blocker: ${audit.proseOnlyWithoutDocumentedBlocker.length}`,
    )
    expect(report).toContain('| Blocked from | Blocker | Capability | Residual gaps |')
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
    level0AFRaw,
    level0GMRaw,
    level0PTRaw,
    level1AFRaw,
    level1FIRaw,
    level1IPRaw,
    level1RTRaw,
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
  it('flags invalid gap codes, duplicate blocker codes, and empty gaps arrays', async () => {
    const { validateSpellModelingConsistency } = await import('./spell-modeling-audit-validation')
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

    const duplicateBlocker = validateSpellModelingConsistency({
      slug: 'duplicate-blocker',
      modeling: {
        blocker: { code: 'effect-schema-missing' },
        gaps: [{ code: 'effect-schema-missing' }],
      },
    } as never)
    expect(duplicateBlocker.some((v) => v.code === 'invalid-modeling-schema')).toBe(true)
  })
})
