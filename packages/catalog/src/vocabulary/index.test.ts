import { describe, expect, it } from 'vitest'
import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import {
  CREATURE_TYPES,
  getSeedCreatureTypeEntry,
  getSeedCreatureTypeLabel,
  getVocabularyOptionById,
  listSeedVocabularySetIds,
  loadSeedCreatureTypes,
  loadSeedVocabularyOptionSet,
  seedCreatureTypeIds,
  seedVocabularyOptionIds,
} from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 creature type vocabulary seed', () => {
  const creatureTypes = loadSeedCreatureTypes(RULESET)

  it('loads the creature-types set (validated against the schema at import)', () => {
    expect(creatureTypes.id).toBe(CREATURE_TYPE_SET_ID)
    expect(creatureTypes.options.length).toBe(14)
  })

  it('uses slug ids as deterministic system option ids', () => {
    for (const option of creatureTypes.options) {
      expect(option.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(option.id).not.toContain(':')
      expect(option.source).toBe('system')
      expect(option.status).toBe('active')
    }
  })

  it('has unique ids', () => {
    const ids = creatureTypes.options.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(seedCreatureTypeIds(RULESET).size).toBe(14)
    expect(seedVocabularyOptionIds(RULESET, CREATURE_TYPE_SET_ID).size).toBe(14)
  })

  it('derives CREATURE_TYPES from the seed list', () => {
    expect([...CREATURE_TYPES].sort()).toEqual([...seedCreatureTypeIds(RULESET)].sort())
  })

  it('has a label and description for every seed type', () => {
    for (const type of CREATURE_TYPES) {
      const entry = getSeedCreatureTypeEntry(RULESET, type)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedCreatureTypeLabel(RULESET, 'humanoid')).toBe('Humanoid')
    expect(getSeedCreatureTypeLabel(RULESET, 'custom')).toBe('custom')
  })

  it('can load an option by id', () => {
    const option = getVocabularyOptionById(RULESET, CREATURE_TYPE_SET_ID, 'humanoid')

    expect(option.label).toBe('Humanoid')
    expect(
      loadSeedVocabularyOptionSet(RULESET, CREATURE_TYPE_SET_ID).options.some(
        (entry) => entry.id === option.id,
      ),
    ).toBe(true)
  })

  it('lists seeded vocabulary set ids for a ruleset', () => {
    expect(listSeedVocabularySetIds(RULESET)).toEqual([CREATURE_TYPE_SET_ID])
  })
})
