import { describe, expect, it } from 'vitest'

import {
  buildBuildingArchetypeSearchTerms,
  filterBuildingArchetypeFieldOptions,
  rankBuildingArchetypeFieldOptions,
} from './building-archetype-form-options'

function matchingArchetypeValues(query: string): string[] {
  return filterBuildingArchetypeFieldOptions(query).map((option) => option.value)
}

describe('buildBuildingArchetypeSearchTerms', () => {
  it('composes registry terms, function labels, and manifestation parent label', () => {
    expect(buildBuildingArchetypeSearchTerms('caravanserai')).toEqual(
      expect.arrayContaining(['caravan', 'lodging', 'retail', 'inn']),
    )
  })
})

describe('building archetype combobox search', () => {
  it('includes inn and caravanserai for lodging', () => {
    expect(matchingArchetypeValues('lodging')).toEqual(
      expect.arrayContaining(['inn', 'caravanserai']),
    )
  })

  it('includes stable for horses', () => {
    expect(matchingArchetypeValues('horses')).toEqual(['stable'])
  })

  it('includes library for books', () => {
    expect(matchingArchetypeValues('books')).toEqual(['library'])
  })

  it('includes temple for worship', () => {
    expect(matchingArchetypeValues('worship')).toEqual(['temple'])
  })

  it('ranks the Inn label above manifestation search-term matches for inn', () => {
    const rankedValues = rankBuildingArchetypeFieldOptions('inn').map((option) => option.value)

    expect(rankedValues[0]).toBe('inn')
    expect(rankedValues).toContain('caravanserai')
  })
})
