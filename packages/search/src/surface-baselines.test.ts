import { describe, expect, it } from 'vitest'

import { matchSearchDocumentQuery, scoreSearchDocument } from './match'
import { normalizeSearchQuery } from './normalize'
import type { SearchDocument, SearchField } from './types'

/** Mirrors legacy `@rpg/ui` `SearchableItem` → `SearchDocument` for parity baselines. */
function uiLabelDocument(text: string, id = 'item'): SearchDocument {
  return { id, fields: [{ key: 'label', text, role: 'primary' }] }
}

function uiFieldsDocument(id: string, fields: SearchField[]): SearchDocument {
  return { id, fields }
}

/** Surface-local rank helper — reproduces `@rpg/ui` `rankItems` using `@rpg/search`. */
function rankDocumentsByQuery<T extends { document: SearchDocument }>(
  rows: readonly T[],
  query: string,
): T[] {
  const normalized = normalizeSearchQuery(query)
  if (normalized.text.length === 0) return [...rows]

  return rows
    .map((row, index) => ({
      row,
      index,
      score: scoreSearchDocument(row.document, query),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.row)
}

describe('combobox and catalog-picker baselines', () => {
  it('scores a single label field like ComboboxField option matching', () => {
    const document = uiLabelDocument('Fire Bolt')
    expect(scoreSearchDocument(document, 'bolt')).toBeGreaterThan(0)
    expect(scoreSearchDocument(document, 'fire-bolt')).toBe(0)
    expect(matchSearchDocumentQuery(document, '')).toEqual({ matched: true })
  })

  it('ranks label prefix above keyword substring like legacy rankItems', () => {
    const rows = [
      {
        name: 'Movement bonus',
        document: uiFieldsDocument('movement', [
          { key: 'label', text: 'Movement bonus', role: 'primary' },
        ]),
      },
      {
        name: 'Skill proficiency',
        document: uiFieldsDocument('skill', [
          { key: 'label', text: 'Skill proficiency', role: 'primary' },
          { key: 'keyword', text: 'athletics', role: 'keyword' },
        ]),
      },
      {
        name: 'Language',
        document: uiFieldsDocument('language', [
          { key: 'label', text: 'Language', role: 'primary' },
        ]),
      },
    ]

    expect(rankDocumentsByQuery(rows, 'skill').map((row) => row.name)).toEqual([
      'Skill proficiency',
    ])
  })

  it('preserves input order for equal scores', () => {
    const rows = ['Alpha', 'Beta', 'Gamma'].map((name) => ({
      name,
      document: uiLabelDocument(name),
    }))

    expect(rankDocumentsByQuery(rows, 'a').map((row) => row.name)).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ])
  })

  it('returns all rows for an empty query', () => {
    const rows = [
      { name: 'Alpha', document: uiLabelDocument('Alpha') },
      { name: 'Beta', document: uiLabelDocument('Beta') },
    ]

    expect(rankDocumentsByQuery(rows, '')).toHaveLength(2)
  })
})

describe('equipment picker baseline (pre-migration)', () => {
  it('matches monolithic label searchText scoring', () => {
    const document = uiLabelDocument('longsword martial melee weapon')

    expect(scoreSearchDocument(document, 'long')).toBe(100)
    expect(scoreSearchDocument(document, 'martial')).toBe(80)
    expect(scoreSearchDocument(document, 'ice')).toBe(0)
  })
})
