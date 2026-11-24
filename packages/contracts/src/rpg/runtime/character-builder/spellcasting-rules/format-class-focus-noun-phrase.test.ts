import { describe, expect, it } from 'vitest'

import { formatClassFocusNounPhrase } from './format-class-focus-noun-phrase'

describe('formatClassFocusNounPhrase', () => {
  it('uses indefinite articles and possessive spellbook phrasing', () => {
    expect(formatClassFocusNounPhrase('holy_symbol')).toBe('a Holy Symbol')
    expect(formatClassFocusNounPhrase('arcane_focus')).toBe('an Arcane Focus')
    expect(formatClassFocusNounPhrase('spellbook')).toBe('your Spellbook')
  })
})
