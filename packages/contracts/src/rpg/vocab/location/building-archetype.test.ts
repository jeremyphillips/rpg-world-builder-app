import { describe, expect, it } from 'vitest'

import {
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  type BuildingFunctionFamily,
} from './building-function-family'
import {
  BUILDING_ARCHETYPE_ENTRIES,
  BUILDING_ARCHETYPE_IDS,
  getBuildingManifestationRoot,
  type BuildingArchetype,
} from './building-archetype'

function normalizeSearchTerms(terms: readonly string[] | undefined): readonly string[] {
  if (!terms) return []
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const term of terms) {
    const value = term.trim().toLowerCase()
    if (!value || seen.has(value)) continue
    seen.add(value)
    normalized.push(value)
  }
  return normalized
}

describe('building archetype registry integrity', () => {
  it('keeps unique archetype ids with valid labels and one or two functions', () => {
    expect(new Set(BUILDING_ARCHETYPE_IDS).size).toBe(BUILDING_ARCHETYPE_IDS.length)

    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      expect(entry.label).not.toBe('')
      expect(entry.description).not.toBe('')
      expect(entry.functions.length).toBeGreaterThanOrEqual(1)
      expect(entry.functions.length).toBeLessThanOrEqual(2)

      for (const fn of entry.functions) {
        expect(fn).toBeDefined()
        expect(BUILDING_FUNCTION_FAMILY_ENTRIES[fn as BuildingFunctionFamily]).toBeDefined()
      }
    }
  })

  it('keeps manifestationOf targets valid with no self-reference or cycles', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('manifestationOf' in entry) || !entry.manifestationOf) continue

      const parent = entry.manifestationOf
      expect(parent).not.toBe(id)
      expect(BUILDING_ARCHETYPE_ENTRIES[parent as BuildingArchetype]).toBeDefined()
      expect(getBuildingManifestationRoot(id)).not.toBe(id)
    }
  })

  it('normalizes search terms to lowercase trimmed deduplicated values', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('searchTerms' in entry) || !entry.searchTerms) continue

      expect(entry.searchTerms).toEqual(normalizeSearchTerms(entry.searchTerms))
      for (const term of entry.searchTerms) {
        expect(term).toBe(term.trim().toLowerCase())
      }
    }
  })
})
