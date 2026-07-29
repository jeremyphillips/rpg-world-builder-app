import { describe, expect, it } from 'vitest'

import { isEmptySearchQuery, normalizeSearchQuery } from './normalize'
import { matchSearchDocument, matchSearchDocumentQuery, scoreSearchDocument } from './match'
import { classifyMatchTier, scoreFieldMatch } from './score'
import type { SearchDocument, SearchField } from './types'

function document(fields: SearchField[]): SearchDocument {
  return { id: 'test', fields }
}

describe('normalizeSearchQuery', () => {
  it('trims and lowercases query text', () => {
    expect(normalizeSearchQuery('  Fireball  ')).toEqual({ text: 'fireball' })
  })

  it('detects empty queries', () => {
    expect(isEmptySearchQuery(normalizeSearchQuery('   '))).toBe(true)
    expect(isEmptySearchQuery(normalizeSearchQuery('fire'))).toBe(false)
  })
})

describe('classifyMatchTier', () => {
  it('classifies exact, prefix, substring, and none', () => {
    expect(classifyMatchTier('Fireball', 'fireball')).toBe('exact')
    expect(classifyMatchTier('Fireball', 'fire')).toBe('prefix')
    expect(classifyMatchTier('Fireball', 'ball')).toBe('substring')
    expect(classifyMatchTier('Fireball', 'ice')).toBe('none')
    expect(classifyMatchTier('Fireball', '')).toBe('none')
    expect(classifyMatchTier('   ', 'fire')).toBe('none')
  })
})

describe('scoreFieldMatch', () => {
  it('applies primary role tier base scores', () => {
    expect(scoreFieldMatch({ key: 'name', text: 'Fireball', role: 'primary' }, 'prefix')).toBe(100)
    expect(scoreFieldMatch({ key: 'name', text: 'Fireball', role: 'primary' }, 'substring')).toBe(
      80,
    )
  })

  it('applies keyword role tier base scores', () => {
    expect(scoreFieldMatch({ key: 'alias', text: 'fire-bolt', role: 'keyword' }, 'exact')).toBe(70)
    expect(scoreFieldMatch({ key: 'alias', text: 'fire-bolt', role: 'keyword' }, 'substring')).toBe(
      55,
    )
  })

  it('applies secondary role substring scores', () => {
    expect(
      scoreFieldMatch(
        { key: 'description', text: 'Homebrew source', role: 'secondary' },
        'substring',
      ),
    ).toBe(10)
  })

  it('multiplies by explicit field weight override', () => {
    expect(
      scoreFieldMatch({ key: 'name', text: 'Darkvision', role: 'primary', weight: 0.8 }, 'prefix'),
    ).toBe(80)
  })

  it('falls back to substring tier scores when a role lacks exact/prefix tiers', () => {
    expect(
      scoreFieldMatch({ key: 'description', text: 'Homebrew', role: 'secondary' }, 'prefix'),
    ).toBe(10)
  })
})

describe('matchSearchDocument', () => {
  it('returns neutral success for empty queries', () => {
    expect(
      matchSearchDocument(document([{ key: 'name', text: 'Rope', role: 'primary' }]), { text: '' }),
    ).toEqual({
      matched: true,
    })
  })

  it('returns the max field score across fields', () => {
    const match = matchSearchDocumentQuery(
      document([
        { key: 'label', text: 'Spells', role: 'primary' },
        { key: 'keyword', text: 'innate', role: 'keyword' },
      ]),
      'spell',
    )

    expect(match).toEqual({ matched: true, tier: 'prefix', score: 100 })
  })

  it('returns unmatched when no field matches', () => {
    expect(
      matchSearchDocumentQuery(
        document([{ key: 'name', text: 'Fireball', role: 'primary' }]),
        'ice',
      ),
    ).toEqual({ matched: false, tier: 'none', score: 0 })
  })

  it('ignores blank field text', () => {
    expect(
      scoreSearchDocument(
        document([
          { key: 'blank', text: '   ', role: 'primary' },
          { key: 'name', text: 'Rope', role: 'primary' },
        ]),
        'rope',
      ),
    ).toBe(100)
  })
})

describe('legacy @rpg/ui search parity', () => {
  /** Maps legacy ui roles to @rpg/search fields for score parity characterization. */
  function uiField(
    text: string,
    role: 'label' | 'alias' | 'keyword' | 'description' | 'group',
    weight = 1,
  ): SearchField {
    switch (role) {
      case 'label':
        return { key: 'label', text, role: 'primary', weight }
      case 'alias':
        return { key: 'alias', text, role: 'keyword', weight }
      case 'keyword':
        return { key: 'keyword', text, role: 'primary', weight: 0.35 * weight }
      case 'description':
        return { key: 'description', text, role: 'secondary', weight }
      case 'group':
        return { key: 'group', text, role: 'secondary', weight: 0.5 * weight }
    }
  }

  it('reproduces label, alias, description, and group tier scores', () => {
    expect(scoreFieldMatch(uiField('Fireball', 'label'), 'prefix')).toBe(100)
    expect(scoreFieldMatch(uiField('Fireball', 'label'), 'substring')).toBe(80)
    expect(scoreFieldMatch(uiField('fire-bolt', 'alias'), 'exact')).toBe(70)
    expect(scoreFieldMatch(uiField('fire-bolt', 'alias'), 'substring')).toBe(55)
    expect(scoreFieldMatch(uiField('Homebrew source', 'description'), 'substring')).toBe(10)
    expect(scoreFieldMatch(uiField('Proficiencies', 'group'), 'substring')).toBe(5)
  })

  it('reproduces legacy keyword tier scores via weighted primary fields', () => {
    expect(
      scoreFieldMatch({ key: 'keyword', text: 'innate', role: 'primary', weight: 0.35 }, 'prefix'),
    ).toBe(35)
    expect(
      scoreFieldMatch(
        { key: 'keyword', text: 'innate', role: 'primary', weight: 0.25 },
        'substring',
      ),
    ).toBe(20)
  })

  it('reproduces single-field equipment picker scoring', () => {
    const item = document([uiField('longsword martial melee weapon', 'label')])
    expect(scoreSearchDocument(item, 'long')).toBe(100)
    expect(scoreSearchDocument(item, 'martial')).toBe(80)
    expect(scoreSearchDocument(item, 'ice')).toBe(0)
    expect(matchSearchDocumentQuery(item, '')).toEqual({ matched: true })
  })
})
