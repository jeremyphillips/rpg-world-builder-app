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
  it('composes registry terms, aliases, function labels, and manifestation inheritance', () => {
    expect(buildBuildingArchetypeSearchTerms('caravanserai')).toEqual(
      expect.arrayContaining(['caravan', 'lodging', 'retail', 'inn', 'traveler']),
    )
    expect(buildBuildingArchetypeSearchTerms('warehouse')).toEqual(
      expect.arrayContaining(['storehouse', 'storage', 'goods', 'cargo']),
    )
  })
})

describe('building archetype combobox search', () => {
  it('includes inn and caravanserai for lodging', () => {
    expect(matchingArchetypeValues('lodging')).toEqual(
      expect.arrayContaining(['inn', 'caravanserai', 'coaching_inn', 'boarding_house']),
    )
  })

  it('includes stable for horses', () => {
    expect(matchingArchetypeValues('horses')).toEqual(expect.arrayContaining(['stable']))
  })

  it('includes armory and arsenal for weapons', () => {
    expect(matchingArchetypeValues('weapons')).toEqual(
      expect.arrayContaining(['armory', 'arsenal']),
    )
  })

  it('includes library for books', () => {
    expect(matchingArchetypeValues('books')).toEqual(
      expect.arrayContaining(['library', 'printing_press']),
    )
  })

  it('includes market and shop for merchant', () => {
    expect(matchingArchetypeValues('merchant')).toEqual(
      expect.arrayContaining(['market', 'shop', 'caravanserai']),
    )
  })

  it('includes temple and mosque for worship', () => {
    expect(matchingArchetypeValues('worship')).toEqual(
      expect.arrayContaining(['temple', 'mosque', 'synagogue']),
    )
  })

  it('includes warehouse and granary for storage', () => {
    expect(matchingArchetypeValues('storage')).toEqual(
      expect.arrayContaining(['warehouse', 'granary', 'armory']),
    )
  })

  it('finds warehouse via storehouse alias', () => {
    expect(matchingArchetypeValues('storehouse')).toEqual(expect.arrayContaining(['warehouse']))
  })

  it('ranks the Inn label above manifestation search-term matches for inn', () => {
    const rankedValues = rankBuildingArchetypeFieldOptions('inn').map((option) => option.value)

    expect(rankedValues[0]).toBe('inn')
    expect(rankedValues).toContain('caravanserai')
  })

  it('ranks warehouse above alias-only matches for storehouse', () => {
    const rankedValues = rankBuildingArchetypeFieldOptions('storehouse').map(
      (option) => option.value,
    )

    expect(rankedValues[0]).toBe('warehouse')
  })
})
