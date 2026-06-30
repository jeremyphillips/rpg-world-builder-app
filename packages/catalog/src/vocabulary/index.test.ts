import { describe, expect, it } from 'vitest'
import {
  ATTACK_RESOLUTION_MODE_ENTRIES,
  ATTACK_RESOLUTION_MODE_IDS,
  ATTACK_RESOLUTION_MODE_SET_ID,
  CREATURE_TYPE_SET_ID,
  DAMAGE_TYPE_SET_ID,
  EDITION_PRESET_ENTRIES,
  EDITION_PRESET_IDS,
  EDITION_PRESET_SET_ID,
  SENSE_SET_ID,
} from '@rpg/contracts'

import {
  ATTACK_RESOLUTION_MODES,
  CREATURE_TYPES,
  DAMAGE_TYPES,
  EDITION_PRESETS,
  SENSES,
  getSeedAttackResolutionModeEntry,
  getSeedAttackResolutionModeLabel,
  getSeedCreatureTypeEntry,
  getSeedCreatureTypeLabel,
  getSeedDamageTypeEntry,
  getSeedDamageTypeLabel,
  getSeedEditionPresetEntry,
  getSeedEditionPresetLabel,
  getSeedSenseEntry,
  getSeedSenseLabel,
  getVocabularyOptionById,
  listSeedVocabularySetIds,
  loadSeedAttackResolutionModes,
  loadSeedCreatureTypes,
  loadSeedDamageTypes,
  loadSeedEditionPresets,
  loadSeedSenses,
  loadSeedVocabularyOptionSet,
  seedAttackResolutionModeIds,
  seedCreatureTypeIds,
  seedDamageTypeIds,
  seedEditionPresetIds,
  seedSenseIds,
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

describe('SRD 5.2.1 damage type vocabulary seed', () => {
  const damageTypes = loadSeedDamageTypes(RULESET)

  it('loads the damage-types set (elemental + planar only)', () => {
    expect(damageTypes.id).toBe(DAMAGE_TYPE_SET_ID)
    expect(damageTypes.options.length).toBe(10)
  })

  it('has unique ids', () => {
    const ids = damageTypes.options.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(seedDamageTypeIds(RULESET).size).toBe(10)
    expect(seedVocabularyOptionIds(RULESET, DAMAGE_TYPE_SET_ID).size).toBe(10)
  })

  it('derives DAMAGE_TYPES from the seed list', () => {
    expect([...DAMAGE_TYPES].sort()).toEqual([...seedDamageTypeIds(RULESET)].sort())
  })

  it('has a label and description for every seed type', () => {
    for (const type of DAMAGE_TYPES) {
      const entry = getSeedDamageTypeEntry(RULESET, type)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedDamageTypeLabel(RULESET, 'fire')).toBe('Fire')
    expect(getSeedDamageTypeLabel(RULESET, 'custom')).toBe('custom')
  })
})

describe('SRD 5.2.1 sense vocabulary seed', () => {
  const senses = loadSeedSenses(RULESET)

  it('loads the senses set', () => {
    expect(senses.id).toBe(SENSE_SET_ID)
    expect(senses.options.length).toBe(4)
  })

  it('has unique ids', () => {
    const ids = senses.options.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(seedSenseIds(RULESET).size).toBe(4)
    expect(seedVocabularyOptionIds(RULESET, SENSE_SET_ID).size).toBe(4)
  })

  it('derives SENSES from the seed list', () => {
    expect([...SENSES].sort()).toEqual([...seedSenseIds(RULESET)].sort())
  })

  it('has a label and description for every seed type', () => {
    for (const type of SENSES) {
      const entry = getSeedSenseEntry(RULESET, type)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedSenseLabel(RULESET, 'darkvision')).toBe('Darkvision')
    expect(getSeedSenseLabel(RULESET, 'custom')).toBe('custom')
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
      [
        ATTACK_RESOLUTION_MODE_SET_ID,
        CREATURE_TYPE_SET_ID,
        DAMAGE_TYPE_SET_ID,
        EDITION_PRESET_SET_ID,
        SENSE_SET_ID,
      ].sort(),
    )
  })
})
