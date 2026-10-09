import { buildSpellPickerSearchText } from '@rpg/contracts'
import { scoreSearchDocument } from '@rpg/search'
import { scoreLegacySearchItem } from '@rpg/ui/lib/search-document'
import { describe, expect, it } from 'vitest'

import { pickSpell } from '@/test/fixtures/pick'

import { spellPickerItemsFixture } from './spell-picker-drawer.fixtures'

const catalogSlugs = ['fire-bolt', 'magic-missile', 'hunters-mark'] as const

const sharedQueries = ['', '   ', 'cantrip', '1st level', 'evocation', 'nomatchxyz']

function scorePair(id: string, text: string, query: string) {
  const legacy = scoreLegacySearchItem(
    { fields: [{ text, weight: 1, role: 'label' }] },
    query,
    'forgiving',
  )
  const next = scoreSearchDocument(
    { id, fields: [{ key: 'combined', text, role: 'primary' }] },
    query,
    { profile: 'forgiving' },
  )
  return { legacy, next }
}

describe('spell picker search parity', () => {
  const documents = [
    ...catalogSlugs.map((slug) => {
      const spell = pickSpell(slug)
      return { id: spell.id, text: buildSpellPickerSearchText(spell), name: spell.name }
    }),
    ...spellPickerItemsFixture.map((item) => ({
      id: item.spell.id,
      text: item.searchText,
      name: item.spell.name,
    })),
  ]

  it('matches legacy label scores and inclusion for representative spells and queries', () => {
    for (const document of documents) {
      const queries = [
        ...sharedQueries,
        document.name,
        document.name.slice(0, 4),
        document.name.split(' ').at(-1) ?? document.name,
        document.name.toUpperCase(),
        document.name.replace(/[\s'-]/g, ''),
        document.name.replace(/\s+/g, '-'),
        `${document.name} ${document.text.split(' ')[1] ?? ''}`.trim(),
      ]

      for (const query of queries) {
        const { legacy, next } = scorePair(document.id, document.text, query)
        expect(next, `${document.name} / ${JSON.stringify(query)}`).toBe(legacy)
        expect(next > 0, `${document.name} / ${JSON.stringify(query)} inclusion`).toBe(legacy > 0)
      }
    }
  })
})
