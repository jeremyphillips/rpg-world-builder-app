import { describe, expect, it } from 'vitest'
import {
  ATTACK_RESOLUTION_MODE_ENTRIES,
  ATTACK_RESOLUTION_MODE_IDS,
  ATTACK_RESOLUTION_MODE_SET_ID,
  CREATURE_TYPE_SET_ID,
  EDITION_PRESET_ENTRIES,
  EDITION_PRESET_IDS,
  EDITION_PRESET_SET_ID,
} from '@rpg/contracts'

import {
  ATTACK_RESOLUTION_MODES,
  CREATURE_TYPES,
  EDITION_PRESETS,
  getSeedAttackResolutionModeEntry,
  getSeedAttackResolutionModeLabel,
  getSeedCreatureTypeEntry,
  getSeedCreatureTypeLabel,
  getSeedEditionPresetEntry,
  getSeedEditionPresetLabel,
  getVocabularyOptionById,
  listSeedVocabularySetIds,
  loadSeedAttackResolutionModes,
  loadSeedCreatureTypes,
  loadSeedEditionPresets,
  loadSeedVocabularyOptionSet,
  seedAttackResolutionModeIds,
  seedCreatureTypeIds,
  seedEditionPresetIds,
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
})

describe('SRD 5.2.1 edition preset vocabulary seed', () => {
  const editionPresets = loadSeedEditionPresets(RULESET)

  it('loads the edition-presets set', () => {
    expect(editionPresets.id).toBe(EDITION_PRESET_SET_ID)
    expect(editionPresets.options.length).toBe(5)
  })

  it('matches contract edition preset ids and copy', () => {
    expect([...EDITION_PRESETS].sort()).toEqual([...EDITION_PRESET_IDS].sort())
    expect(seedEditionPresetIds(RULESET).size).toBe(EDITION_PRESET_IDS.length)

    for (const id of EDITION_PRESET_IDS) {
      const seed = getSeedEditionPresetEntry(RULESET, id)
      const contract = EDITION_PRESET_ENTRIES[id]
      expect(seed?.label).toBe(contract.label)
      expect(seed?.description).toBe(contract.description)
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedEditionPresetLabel(RULESET, '5e')).toBe('Modern 5e')
    expect(getSeedEditionPresetLabel(RULESET, 'custom')).toBe('custom')
  })
})

describe('SRD 5.2.1 attack resolution mode vocabulary seed', () => {
  const attackResolutionModes = loadSeedAttackResolutionModes(RULESET)

  it('loads the attack-resolution-modes set', () => {
    expect(attackResolutionModes.id).toBe(ATTACK_RESOLUTION_MODE_SET_ID)
    expect(attackResolutionModes.options.length).toBe(5)
  })

  it('matches contract attack resolution mode ids and copy', () => {
    expect([...ATTACK_RESOLUTION_MODES].sort()).toEqual([...ATTACK_RESOLUTION_MODE_IDS].sort())
    expect(seedAttackResolutionModeIds(RULESET).size).toBe(ATTACK_RESOLUTION_MODE_IDS.length)

    for (const id of ATTACK_RESOLUTION_MODE_IDS) {
      const seed = getSeedAttackResolutionModeEntry(RULESET, id)
      const contract = ATTACK_RESOLUTION_MODE_ENTRIES[id]
      expect(seed?.label).toBe(contract.label)
      expect(seed?.description).toBe(contract.description)
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedAttackResolutionModeLabel(RULESET, 'proficiency_attack_vs_ac')).toBe(
      'Proficiency attack vs. AC',
    )
    expect(getSeedAttackResolutionModeLabel(RULESET, 'custom')).toBe('custom')
  })
})

describe('seeded vocabulary set registry', () => {
  it('lists every seeded vocabulary set id for a ruleset', () => {
    expect(listSeedVocabularySetIds(RULESET).sort()).toEqual(
      [CREATURE_TYPE_SET_ID, EDITION_PRESET_SET_ID, ATTACK_RESOLUTION_MODE_SET_ID].sort(),
    )
  })
})
