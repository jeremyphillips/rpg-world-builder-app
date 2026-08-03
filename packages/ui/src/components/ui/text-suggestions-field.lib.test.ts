import { describe, expect, it } from 'vitest'

import { filterTextSuggestions, formatTextSuggestionLabel } from './text-suggestions-field.lib'

describe('text-suggestions-field.lib', () => {
  it('filters suggestions by case-insensitive substring', () => {
    const suggestions = ['coaching inn', 'roadside inn', 'ferry house']
    expect(filterTextSuggestions(suggestions, 'inn')).toEqual(['coaching inn', 'roadside inn'])
    expect(filterTextSuggestions(suggestions, 'FERRY')).toEqual(['ferry house'])
  })

  it('returns all suggestions for an empty query', () => {
    const suggestions = ['sea temple', 'funerary temple']
    expect(filterTextSuggestions(suggestions, '')).toEqual(suggestions)
  })

  it('title-cases suggestion labels for display', () => {
    expect(formatTextSuggestionLabel('coaching inn')).toBe('Coaching inn')
    expect(formatTextSuggestionLabel(' bonded warehouse ')).toBe('Bonded warehouse')
  })
})
