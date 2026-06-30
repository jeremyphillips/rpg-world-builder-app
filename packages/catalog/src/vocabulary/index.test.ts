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
  LANGUAGE_SET_ID,
  SENSE_SET_ID,
  SPELL_SCHOOL_SET_ID,
} from '@rpg/contracts'

import {
  ATTACK_RESOLUTION_MODES,
  CREATURE_TYPES,
  DAMAGE_TYPES,
  EDITION_PRESETS,
  LANGUAGES,
  SENSES,
  SPELL_SCHOOLS,
  getSeedAttackResolutionModeEntry,
  getSeedAttackResolutionModeLabel,
  getSeedCreatureTypeEntry,
  getSeedCreatureTypeLabel,
  getSeedDamageTypeEntry,
  getSeedDamageTypeLabel,
  getSeedEditionPresetEntry,
  getSeedEditionPresetLabel,
  getSeedLanguageCategory,
  getSeedLanguageEntry,
  getSeedLanguageLabel,
  getSeedSenseEntry,
  getSeedSenseLabel,
  getSeedSpellSchoolEntry,
  getSeedSpellSchoolLabel,
  getVocabularyOptionById,
  listSeedVocabularySetIds,
  loadSeedAttackResolutionModes,
  loadSeedCreatureTypes,
  loadSeedDamageTypes,
  loadSeedEditionPresets,
  loadSeedLanguages,
  loadSeedSenses,
  loadSeedSpellSchools,
  loadSeedVocabularyOptionSet,
  seedAttackResolutionModeIds,
  seedCreatureTypeIds,
  seedDamageTypeIds,
  seedEditionPresetIds,
  seedLanguageIds,
  seedLanguageIdsByCategory,
  seedSenseIds,
  seedSpellSchoolIds,
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

describe('SRD 5.2.1 language vocabulary seed', () => {
  const languages = loadSeedLanguages(RULESET)

  it('loads the languages set', () => {
    expect(languages.id).toBe(LANGUAGE_SET_ID)
    expect(languages.options.length).toBe(18)
  })

  it('has unique ids and standard/rare categories on seed rows', () => {
    const ids = languages.options.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(seedLanguageIds(RULESET).size).toBe(18)
    expect(seedLanguageIdsByCategory(RULESET, 'standard').length).toBe(9)
    expect(seedLanguageIdsByCategory(RULESET, 'rare').length).toBe(9)
    expect(getSeedLanguageCategory(RULESET, 'common')).toBe('standard')
    expect(getSeedLanguageCategory(RULESET, 'druidic')).toBe('rare')
  })

  it('derives LANGUAGES from the seed list', () => {
    expect([...LANGUAGES].sort()).toEqual([...seedLanguageIds(RULESET)].sort())
  })

  it('has a label and description for every seed language', () => {
    for (const id of LANGUAGES) {
      const entry = getSeedLanguageEntry(RULESET, id)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
      expect(entry?.category).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedLanguageLabel(RULESET, 'common')).toBe('Common')
    expect(getSeedLanguageLabel(RULESET, 'custom')).toBe('custom')
  })
})

describe('SRD 5.2.1 spell school vocabulary seed', () => {
  const spellSchools = loadSeedSpellSchools(RULESET)

  it('loads the spell-schools set', () => {
    expect(spellSchools.id).toBe(SPELL_SCHOOL_SET_ID)
    expect(spellSchools.options.length).toBe(8)
  })

  it('has unique ids', () => {
    const ids = spellSchools.options.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(seedSpellSchoolIds(RULESET).size).toBe(8)
  })

  it('derives SPELL_SCHOOLS from the seed list', () => {
    expect([...SPELL_SCHOOLS].sort()).toEqual([...seedSpellSchoolIds(RULESET)].sort())
  })

  it('has a label and description for every seed school', () => {
    for (const id of SPELL_SCHOOLS) {
      const entry = getSeedSpellSchoolEntry(RULESET, id)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSeedSpellSchoolLabel(RULESET, 'evocation')).toBe('Evocation')
    expect(getSeedSpellSchoolLabel(RULESET, 'custom')).toBe('custom')
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
        LANGUAGE_SET_ID,
        SENSE_SET_ID,
        SPELL_SCHOOL_SET_ID,
      ].sort(),
    )
  })
})
