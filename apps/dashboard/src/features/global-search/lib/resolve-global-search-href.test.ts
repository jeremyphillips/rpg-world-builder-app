import { describe, expect, it } from 'vitest'

import type { GlobalSearchDocument } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { parseGlobalSearchUrlGroup } from './global-search-url'
import {
  buildGlobalSearchGroupSections,
  filterGlobalSearchByGroup,
  rankGlobalSearchDocuments,
} from './rank-global-search'
import { resolveGlobalSearchHref } from './resolve-global-search-href'

const campaignId = 'campaign-1'

describe('resolveGlobalSearchHref', () => {
  it('maps content and character targets to campaign routes', () => {
    expect(resolveGlobalSearchHref(campaignId, { kind: 'spell', id: 'spell-1' })).toBe(
      '/campaigns/campaign-1/spells/spell-1',
    )
    expect(
      resolveGlobalSearchHref(campaignId, {
        kind: 'character',
        id: 'pc-1',
        characterType: 'pc',
      }),
    ).toBe('/campaigns/campaign-1/characters/pc-1')
    expect(
      resolveGlobalSearchHref(campaignId, {
        kind: 'character',
        id: 'npc-1',
        characterType: 'npc',
      }),
    ).toBe('/campaigns/campaign-1/npcs/npc-1')
    expect(
      resolveGlobalSearchHref(campaignId, {
        kind: 'game-term',
        setId: 'set-1',
        termId: 'term-1',
      }),
    ).toBe('/campaigns/campaign-1/game-terms/set-1/term-1')
    expect(
      resolveGlobalSearchHref(campaignId, {
        kind: 'equipment',
        family: 'weapons',
        id: 'item-1',
      }),
    ).toBe('/campaigns/campaign-1/equipment/weapons/item-1')
  })
})

function makeDocument(
  overrides: Partial<GlobalSearchDocument> & Pick<GlobalSearchDocument, 'id' | 'title'>,
): GlobalSearchDocument {
  return {
    filterGroup: 'content',
    typeLabel: 'Spell',
    secondary: '',
    target: { kind: 'spell', id: overrides.id },
    fields: [{ text: overrides.title, weight: 1, role: 'label' }],
    ...overrides,
  }
}

describe('rankGlobalSearchDocuments', () => {
  it('returns no matches for blank queries', () => {
    const documents = [makeDocument({ id: 'a', title: 'Fireball' })]

    expect(rankGlobalSearchDocuments(documents, '')).toEqual([])
    expect(rankGlobalSearchDocuments(documents, '   ')).toEqual([])
  })

  it('ranks matching documents and groups them for preview sections', () => {
    const documents = [
      makeDocument({ id: 'spell-1', title: 'Fireball', filterGroup: 'content' }),
      makeDocument({
        id: 'char-1',
        title: 'Aria',
        filterGroup: 'characters',
        typeLabel: 'Character',
        target: { kind: 'character', id: 'char-1', characterType: 'pc' },
        fields: [{ text: 'Aria', weight: 1, role: 'label' }],
      }),
    ]

    const ranked = rankGlobalSearchDocuments(documents, 'fire')
    expect(ranked.map((document) => document.id)).toEqual(['spell-1'])

    const sections = buildGlobalSearchGroupSections(ranked, 6)
    expect(sections).toHaveLength(1)
    expect(sections[0]?.filterGroup).toBe('content')

    expect(filterGlobalSearchByGroup(ranked, 'characters')).toEqual([])
    expect(filterGlobalSearchByGroup(ranked, 'all')).toEqual(ranked)
  })

  it('matches Fire Bolt with forgiving queries firebolt and fire bolt', () => {
    const documents = [
      makeDocument({
        id: 'fire-bolt',
        title: 'Fire Bolt',
        fields: [{ text: 'Fire Bolt', weight: 1, role: 'label' }],
      }),
    ]

    expect(rankGlobalSearchDocuments(documents, 'firebolt').map((doc) => doc.id)).toEqual([
      'fire-bolt',
    ])
    expect(rankGlobalSearchDocuments(documents, 'fire bolt').map((doc) => doc.id)).toEqual([
      'fire-bolt',
    ])
  })
})

describe('parseGlobalSearchUrlGroup', () => {
  it('defaults to all and accepts known segments', () => {
    expect(parseGlobalSearchUrlGroup(null)).toBe('all')
    expect(parseGlobalSearchUrlGroup('characters')).toBe('characters')
    expect(parseGlobalSearchUrlGroup('unknown')).toBe('all')
    expect(ROUTES.campaign.search('c1', { q: ' fire ', group: 'content' })).toBe(
      '/campaigns/c1/search?q=fire&group=content',
    )
  })
})
