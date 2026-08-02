import { describe, expect, it } from 'vitest'

import type { GlobalSearchDocument } from '@rpg/contracts'

import {
  countGlobalSearchByGroup,
  filterGlobalSearchByGroup,
  rankGlobalSearchDocuments,
} from './rank-global-search'

function document(
  overrides: Partial<GlobalSearchDocument> & Pick<GlobalSearchDocument, 'id' | 'filterGroup'>,
): GlobalSearchDocument {
  return {
    typeLabel: 'Spell',
    title: overrides.title ?? 'Fireball',
    secondary: '',
    target: { kind: 'spell', id: overrides.id },
    fields: [{ text: overrides.title ?? 'Fireball', weight: 1, role: 'label' as const }],
    ...overrides,
  }
}

describe('countGlobalSearchByGroup', () => {
  it('counts all documents and per filter group before group filtering', () => {
    const documents = [
      document({ id: '1', filterGroup: 'content', title: 'Fireball' }),
      document({ id: '2', filterGroup: 'content', title: 'Fire Bolt' }),
      document({ id: '3', filterGroup: 'characters', title: 'Aria' }),
    ]

    const ranked = rankGlobalSearchDocuments(documents, 'fire')
    const counts = countGlobalSearchByGroup(ranked)

    expect(counts.all).toBe(2)
    expect(counts.content).toBe(2)
    expect(counts.characters).toBe(0)
    expect(counts['game-terms']).toBe(0)
  })

  it('keeps pre-filter counts stable when an active group filter is applied', () => {
    const documents = [
      document({ id: '1', filterGroup: 'content', title: 'Fireball' }),
      document({ id: '2', filterGroup: 'characters', title: 'Fireheart' }),
    ]

    const ranked = rankGlobalSearchDocuments(documents, 'fire')
    const counts = countGlobalSearchByGroup(ranked)
    const filtered = filterGlobalSearchByGroup(ranked, 'content')

    expect(filtered).toHaveLength(1)
    expect(counts.all).toBe(2)
    expect(counts.content).toBe(1)
    expect(counts.characters).toBe(1)
  })
})
