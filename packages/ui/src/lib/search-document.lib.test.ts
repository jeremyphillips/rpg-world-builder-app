import { scoreSearchDocument } from '@rpg/search'
import { describe, expect, it } from 'vitest'

import { scoreLegacySearchItem } from './search-document.lib'

const documents = [
  { id: 'fire-bolt', text: 'Fire Bolt' },
  { id: 'hunters-mark', text: "Hunter's Mark" },
  { id: 'magic-missile', text: 'Magic Missile' },
] as const

function queriesFor(text: string): string[] {
  return [
    '',
    '   ',
    text.slice(0, 4),
    text.split(' ').at(-1) ?? text,
    text.toUpperCase(),
    text.replace(/[\s'-]/g, ''),
    text.replace(/\s+/g, '-'),
    'nomatchxyz',
  ]
}

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

describe('scoreLegacySearchItem', () => {
  it('matches scoreSearchDocument for plain label documents', () => {
    for (const document of documents) {
      for (const query of queriesFor(document.text)) {
        const { legacy, next } = scorePair(document.id, document.text, query)
        expect(next, `${document.text} / ${JSON.stringify(query)}`).toBe(legacy)
        expect(next > 0, `${document.text} / ${JSON.stringify(query)} inclusion`).toBe(legacy > 0)
      }
    }
  })
})
