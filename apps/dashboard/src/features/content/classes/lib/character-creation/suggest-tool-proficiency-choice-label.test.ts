import { describe, expect, it } from 'vitest'

import { suggestToolProficiencyChoiceLabel } from './suggest-tool-proficiency-choice-label'

describe('suggestToolProficiencyChoiceLabel', () => {
  it('joins two categories with "or"', () => {
    expect(suggestToolProficiencyChoiceLabel(['artisan', 'musical_instrument'])).toBe(
      "Artisan's Tools or Musical Instrument",
    )
  })

  it('returns a single category label', () => {
    expect(suggestToolProficiencyChoiceLabel(['gaming_set'])).toBe('Gaming Set')
  })
})
