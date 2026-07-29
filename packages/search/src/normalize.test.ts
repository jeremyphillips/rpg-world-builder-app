import { describe, expect, it } from 'vitest'

import { matchSearchDocumentQuery } from './match'
import {
  foldAlphanumeric,
  foldSeparators,
  MIN_FOLDED_QUERY_LENGTH,
  normalizeSearchQuery,
} from './normalize'

describe('foldSeparators', () => {
  it('collapses whitespace and common separators', () => {
    expect(foldSeparators('Fire Bolt')).toBe('firebolt')
    expect(foldSeparators('fire-bolt')).toBe('firebolt')
    expect(foldSeparators('fire_ball')).toBe('fireball')
    expect(foldSeparators('fire.ball')).toBe('fireball')
  })
})

describe('foldAlphanumeric', () => {
  it('lowercases and strips non-alphanumeric characters', () => {
    expect(foldAlphanumeric('  Fix: Auth Bug!  ')).toBe('fixauthbug')
  })
})

describe('normalizeSearchQuery profiles', () => {
  it('adds folded text for forgiving queries', () => {
    expect(normalizeSearchQuery('Fire Bolt', { profile: 'forgiving' })).toEqual({
      text: 'fire bolt',
      folded: 'firebolt',
      profile: 'forgiving',
    })
  })

  it('omits folded text for literal profile', () => {
    expect(normalizeSearchQuery('Fire Bolt')).toEqual({ text: 'fire bolt', profile: 'literal' })
  })

  it('omits separator folded text when the folded form is too short', () => {
    expect(normalizeSearchQuery('a-b', { profile: 'forgiving' })).toEqual({
      text: 'a-b',
      profile: 'forgiving',
    })
    expect(MIN_FOLDED_QUERY_LENGTH).toBe(3)
  })

  it('adds alphanumeric folded text for dev-bench ticket search', () => {
    expect(normalizeSearchQuery('Auth Bug!', { profile: 'alphanumeric' })).toEqual({
      text: 'auth bug!',
      folded: 'authbug',
      profile: 'alphanumeric',
    })
  })
})

describe('alphanumeric match profile', () => {
  it('matches ticket titles with punctuation stripped', () => {
    expect(
      matchSearchDocumentQuery(
        {
          id: 'ticket',
          fields: [{ key: 'title', text: 'Validate epic area on create', role: 'primary' }],
        },
        'epic area',
        { profile: 'alphanumeric' },
      ).matched,
    ).toBe(true)
  })

  it('returns neutral success for empty alphanumeric queries', () => {
    expect(
      matchSearchDocumentQuery(
        { id: 'ticket', fields: [{ key: 'title', text: 'Any title', role: 'primary' }] },
        '!!!',
        { profile: 'alphanumeric' },
      ),
    ).toEqual({ matched: true })
  })
})
