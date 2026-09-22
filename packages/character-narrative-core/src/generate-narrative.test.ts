import { describe, expect, it } from 'vitest'

import type {
  NarrativeCollection,
  NarrativeGenerationContext,
} from '@rpg/contracts/character-narrative'

import { generateNarrative } from './generate-narrative'

const context: NarrativeGenerationContext = {
  alignment: 'lg',
  characterKind: 'pc',
  level: 1,
  affinities: [],
  tokens: {},
  organizations: [],
  residences: [],
  omittedReferenceIds: [],
}

const foundationCollection: NarrativeCollection = {
  revision: 'test',
  fragments: [
    ...[
      'personalityTraits',
      'ideals',
      'bonds',
      'flaws',
      'experience',
      'choice',
      'motivation',
    ].flatMap((slot) => {
      const count = slot === 'personalityTraits' ? 2 : 1
      return Array.from({ length: count }, (_, index) => ({
        id: `fallback-${slot}-${index}`,
        slot: slot as NarrativeCollection['fragments'][number]['slot'],
        text: `I have a ${slot} ${index}.`,
        themeIds: ['duty' as const],
        requires: [],
        affinities: [],
        conflictTags: [],
        weight: 1,
        fallback: true,
      }))
    }),
    {
      id: 'ce-ideal',
      slot: 'ideals',
      text: 'I choose force when patience is a lie.',
      alignmentIds: ['ce'],
      themeIds: ['duty'],
      requires: [],
      affinities: [],
      conflictTags: [],
      weight: 1,
      fallback: false,
    },
  ],
}

describe('generateNarrative', () => {
  it('produces a deterministic complete result', () => {
    const first = generateNarrative({ context, collection: foundationCollection, seed: 42 })
    const second = generateNarrative({ context, collection: foundationCollection, seed: 42 })

    expect(first).toEqual(second)
    expect(first.ok).toBe(true)
    if (first.ok) {
      expect(first.narrative.personalityTraits).toHaveLength(2)
      expect(first.narrative.backstoryParagraphs).toHaveLength(3)
      expect(first.fragmentIds).toHaveLength(8)
    }
  })

  it('never selects a fragment restricted to another alignment', () => {
    const result = generateNarrative({
      context: { ...context, alignment: 'ce' },
      collection: foundationCollection,
      seed: 7,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.fragmentIds.some((id) => id.startsWith('lg-'))).toBe(false)
      expect(result.narrative.ideals[0]).toContain('force')
    }
  })

  it('supports NPC generation contexts', () => {
    const result = generateNarrative({
      context: { ...context, characterKind: 'npc' },
      collection: foundationCollection,
      seed: 9,
    })

    expect(result.ok).toBe(true)
  })
})
