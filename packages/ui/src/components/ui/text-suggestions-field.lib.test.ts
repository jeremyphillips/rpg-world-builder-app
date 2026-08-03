import { describe, expect, it } from 'vitest'

import { formatTextSuggestionLabel } from './text-suggestions-field.lib'

describe('text-suggestions-field.lib', () => {
  it('title-cases suggestion labels for display only', () => {
    expect(formatTextSuggestionLabel('coaching inn')).toBe('Coaching inn')
    expect(formatTextSuggestionLabel(' bonded warehouse ')).toBe('Bonded warehouse')
  })
})
