import { generateNarrative } from '@rpg/character-narrative-core'
import { loadNarrativeCollection } from '@rpg/character-narrative-data'
import { ALIGNMENTS } from '@rpg/contracts'
import type { NarrativeGenerationContext, NarrativeSlot } from '@rpg/contracts/character-narrative'
import { describe, expect, it } from 'vitest'

const ALIGNMENT_SENSITIVE_SLOTS = [
  'ideals',
  'flaws',
  'choice',
  'motivation',
] as const satisfies readonly NarrativeSlot[]

const SELECTION_SMOKE_SEEDS = Array.from({ length: 24 }, (_, index) => index + 1)

const sparseContext: NarrativeGenerationContext = {
  characterKind: 'pc',
  level: 1,
  affinities: [],
  tokens: {},
  organizations: [],
  residences: [],
  people: [],
  places: [],
  boundConditions: [],
  omittedReferenceIds: [],
}

describe('foundation alignment selection smoke', () => {
  it('selects multiple explicit alignment-tagged fragments per slot across seeds', async () => {
    const collection = await loadNarrativeCollection()
    const fragmentsById = new Map(collection.fragments.map((fragment) => [fragment.id, fragment]))

    for (const alignment of ALIGNMENTS) {
      for (const slot of ALIGNMENT_SENSITIVE_SLOTS) {
        const explicitIds = new Set<string>()

        for (const seed of SELECTION_SMOKE_SEEDS) {
          const result = generateNarrative({
            collection,
            context: { ...sparseContext, alignment },
            seed,
          })
          expect(result.ok, `${alignment} seed ${seed}`).toBe(true)
          if (!result.ok) continue

          for (const id of result.fragmentIds) {
            const fragment = fragmentsById.get(id)
            if (fragment?.slot === slot && fragment.alignmentIds?.includes(alignment)) {
              explicitIds.add(id)
            }
          }
        }

        expect(
          explicitIds.size,
          `${alignment} × ${slot}: ${[...explicitIds].join(', ')}`,
        ).toBeGreaterThanOrEqual(2)
      }
    }
  })
})
