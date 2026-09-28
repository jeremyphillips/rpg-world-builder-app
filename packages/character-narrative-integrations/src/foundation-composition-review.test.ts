import { generateNarrative } from '@rpg/character-narrative-core'
import { loadNarrativeCollection } from '@rpg/character-narrative-data'
import { NARRATIVE_TOKEN_PATTERN } from '@rpg/contracts/character-narrative'
import { describe, expect, it } from 'vitest'

import { FOUNDATION_COMPOSITION_REVIEW_CASES } from './foundation-composition-review.fixture'

describe('foundation composition review fixture', () => {
  it('keeps the fixed editorial review matrix complete and reproducible', async () => {
    const collection = await loadNarrativeCollection()
    const fragmentsById = new Map(collection.fragments.map((fragment) => [fragment.id, fragment]))
    const selectedIds = new Set<string>()

    expect(FOUNDATION_COMPOSITION_REVIEW_CASES).toHaveLength(24)

    for (const reviewCase of FOUNDATION_COMPOSITION_REVIEW_CASES) {
      const first = generateNarrative({
        collection,
        context: reviewCase.context,
        seed: reviewCase.seed,
      })
      const second = generateNarrative({
        collection,
        context: reviewCase.context,
        seed: reviewCase.seed,
      })

      expect(first, reviewCase.name).toEqual(second)
      expect(first.ok, reviewCase.name).toBe(true)
      if (!first.ok) continue

      expect(first.fragmentIds, reviewCase.name).toHaveLength(8)
      expect(first.narrative.personalityTraits, reviewCase.name).toHaveLength(2)
      expect(first.narrative.backstoryParagraphs, reviewCase.name).toHaveLength(3)
      expect(first.usedFallback, reviewCase.name).toBe(false)

      const prose = [
        ...first.narrative.personalityTraits,
        ...first.narrative.ideals,
        ...first.narrative.bonds,
        ...first.narrative.flaws,
        ...first.narrative.backstoryParagraphs,
      ].join(' ')
      expect(prose, reviewCase.name).not.toMatch(new RegExp(NARRATIVE_TOKEN_PATTERN))

      const selectedFragments = first.fragmentIds.flatMap((id) => {
        const fragment = fragmentsById.get(id)
        return fragment ? [fragment] : []
      })
      if (reviewCase.minimumConditionedFragments !== undefined) {
        expect(
          selectedFragments.filter((fragment) => fragment.conditions.length > 0),
          reviewCase.name,
        ).toHaveLength(reviewCase.minimumConditionedFragments)
      }
      if (reviewCase.expectedCondition) {
        expect(
          selectedFragments.some((fragment) =>
            fragment.conditions.includes(reviewCase.expectedCondition!),
          ),
          reviewCase.name,
        ).toBe(true)
      }

      for (const id of first.fragmentIds) {
        selectedIds.add(id)
        const fragment = fragmentsById.get(id)
        expect(fragment, `${reviewCase.name}: ${id}`).toBeDefined()
        if (fragment?.alignmentIds) {
          expect(fragment.alignmentIds, `${reviewCase.name}: ${id}`).toContain(
            reviewCase.context.alignment,
          )
        }
      }
    }

    expect(selectedIds.size).toBeGreaterThanOrEqual(35)
  })
})
