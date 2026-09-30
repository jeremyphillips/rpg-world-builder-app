import {
  NARRATIVE_FRAGMENT_CONDITION_ENTRIES,
  NARRATIVE_SLOTS,
  NARRATIVE_THEMES,
  type NarrativeSlot,
} from '@rpg/contracts/character-narrative'
import { ALIGNMENTS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  ALIGNMENT_SENSITIVE_SLOTS,
  buildFoundationInventory,
  findHighTextOverlap,
  findRepeatedOpenings,
  LINTABLE_GENERIC_PHRASES,
  LINTABLE_PLACEHOLDER_PHRASES,
  LINTABLE_RETROSPECTIVE_PHRASES,
  LINTABLE_SUMMARY_PHRASES,
} from './foundation-audit.test-support'
import { foundationCollection } from './foundation'

const MINIMUM_THEME_COVERAGE: Record<NarrativeSlot, number> = {
  personalityTraits: 8,
  ideals: 8,
  bonds: 6,
  flaws: 8,
  experience: 6,
  choice: 6,
  motivation: 6,
}

const MIN_EXPLICIT_ALIGNMENT_COVERAGE = 2

describe('foundation narrative collection', () => {
  it('loads validated authored fragments', () => {
    expect(foundationCollection.revision).toBe('foundation-6')
    expect(foundationCollection.fragments).not.toHaveLength(0)
  })

  it('includes relationship-conditioned fragments for Phase 7 enrichment', () => {
    const relationshipFragmentIds = [
      'relationship-hometown-1',
      'relationship-org-obligation-1',
      'relationship-mentor-1',
      'relationship-child-1',
      'relationship-rival-1',
    ]

    for (const id of relationshipFragmentIds) {
      const fragment = foundationCollection.fragments.find((entry) => entry.id === id)
      expect(fragment).toBeDefined()
      expect(fragment?.conditions.length).toBeGreaterThan(0)
      expect(fragment?.requires.length).toBeGreaterThan(0)
    }
  })

  it('provides enough fallback fragments per theme and slot', () => {
    for (const theme of NARRATIVE_THEMES) {
      for (const slot of NARRATIVE_SLOTS) {
        const fallbackCount = foundationCollection.fragments.filter(
          (fragment) =>
            fragment.fallback && fragment.themeIds.includes(theme) && fragment.slot === slot,
        ).length
        const required = slot === 'personalityTraits' ? 2 : 1
        expect(fallbackCount).toBeGreaterThanOrEqual(required)
      }
    }
  })

  it('meets the editorial coverage matrix floors', () => {
    const inventory = buildFoundationInventory(foundationCollection)

    for (const slot of NARRATIVE_SLOTS) {
      for (const theme of NARRATIVE_THEMES) {
        expect(inventory.slotTheme[slot][theme], `${slot} × ${theme}`).toBeGreaterThanOrEqual(
          MINIMUM_THEME_COVERAGE[slot],
        )
      }
    }

    for (const condition of Object.keys(NARRATIVE_FRAGMENT_CONDITION_ENTRIES)) {
      expect(
        inventory.conditions[condition as keyof typeof inventory.conditions],
        condition,
      ).toBeGreaterThanOrEqual(1)
    }

    expect(inventory.hookShapes.direct).toBeGreaterThanOrEqual(20)
    expect(inventory.hookShapes.pressure).toBeGreaterThanOrEqual(20)
    expect(inventory.hookShapes.tension).toBeGreaterThanOrEqual(15)
  })

  it('meets alignment-specific coverage for alignment-sensitive slots', () => {
    const inventory = buildFoundationInventory(foundationCollection)

    for (const slot of ALIGNMENT_SENSITIVE_SLOTS) {
      for (const alignment of ALIGNMENTS) {
        expect(
          inventory.explicitAlignmentCoverage[slot][alignment],
          `${slot} × ${alignment}`,
        ).toBeGreaterThanOrEqual(MIN_EXPLICIT_ALIGNMENT_COVERAGE)
      }
    }
  })

  it('rejects generic abstractions and obvious prose duplication', () => {
    const normalizedText = foundationCollection.fragments
      .map((fragment) => fragment.text.toLowerCase())
      .join('\n')

    const disallowedPhrases = [
      ...LINTABLE_GENERIC_PHRASES,
      ...LINTABLE_RETROSPECTIVE_PHRASES,
      ...LINTABLE_PLACEHOLDER_PHRASES,
      ...LINTABLE_SUMMARY_PHRASES,
    ]

    for (const phrase of disallowedPhrases) {
      expect(normalizedText, phrase).not.toContain(phrase)
    }

    expect(findHighTextOverlap(foundationCollection.fragments)).toEqual([])
    expect(findRepeatedOpenings(foundationCollection.fragments)).toEqual([])
  })
})
