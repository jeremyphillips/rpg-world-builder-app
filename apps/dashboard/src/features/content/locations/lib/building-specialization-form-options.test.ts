import { describe, expect, it } from 'vitest'

import { getBuildingSpecializationTerms } from '@rpg/contracts'

import { resolveBuildingSpecializationSuggestions } from './building-specialization-form-options'

describe('resolveBuildingSpecializationSuggestions', () => {
  it('returns registry suggestions for inn and temple archetypes', () => {
    expect(resolveBuildingSpecializationSuggestions({ 'classification.archetype': 'inn' })).toEqual(
      expect.arrayContaining(['ferry house', 'roadside inn']),
    )
    expect(
      resolveBuildingSpecializationSuggestions({ 'classification.archetype': 'temple' }),
    ).toEqual(expect.arrayContaining(['cathedral', 'sea temple', 'funerary temple']))
  })

  it('returns an empty list when archetype is unset or unknown', () => {
    expect(resolveBuildingSpecializationSuggestions({})).toEqual([])
    expect(
      resolveBuildingSpecializationSuggestions({ 'classification.archetype': 'not_real' }),
    ).toEqual([])
  })

  it('returns an empty list for archetypes without registry specialization terms', () => {
    expect(
      resolveBuildingSpecializationSuggestions({ 'classification.archetype': 'domus' }),
    ).toEqual([])
  })

  it('sources suggestions solely from getBuildingSpecializationTerms', () => {
    for (const archetype of ['inn', 'temple', 'warehouse'] as const) {
      expect(
        resolveBuildingSpecializationSuggestions({ 'classification.archetype': archetype }),
      ).toEqual(getBuildingSpecializationTerms(archetype))
    }
  })
})
