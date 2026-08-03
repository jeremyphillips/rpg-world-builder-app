import { describe, expect, it } from 'vitest'

import { resolveBuildingSpecializationSuggestions } from './building-specialization-form-options'

describe('resolveBuildingSpecializationSuggestions', () => {
  it('returns registry suggestions for a selected archetype', () => {
    expect(resolveBuildingSpecializationSuggestions({ 'classification.archetype': 'inn' })).toEqual(
      expect.arrayContaining(['ferry house', 'roadside inn']),
    )
  })

  it('returns an empty list when archetype is unset or unknown', () => {
    expect(resolveBuildingSpecializationSuggestions({})).toEqual([])
    expect(
      resolveBuildingSpecializationSuggestions({ 'classification.archetype': 'not_real' }),
    ).toEqual([])
  })
})
