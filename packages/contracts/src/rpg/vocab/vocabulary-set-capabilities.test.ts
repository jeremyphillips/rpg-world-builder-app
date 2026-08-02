import { describe, expect, it } from 'vitest'

import { VOCABULARY_OPTION_SET_IDS } from './vocabulary'
import {
  VOCABULARY_SET_CAPABILITIES,
  type VocabularySetCapability,
  validateVocabularySetCapabilityImplications,
  vocabularySetIdsRequiringFormDefinition,
  vocabularySetIdsRequiringBatchCountResolver,
  vocabularySetIdsRequiringUsageResolver,
  vocabularySetIdsWithBrowse,
} from './vocabulary-set-capabilities'
import { VOCABULARY_INTERNAL_ONLY_SET_IDS } from './vocabulary-category-registry'

const BROWSE_SETS_WITH_USAGE_RESOLUTION = [
  'creature-types',
  'damage-types',
  'conditions',
  'languages',
  'senses',
  'sizes',
  'spell-schools',
  'weapon-properties',
  'equipment-categories',
] as const

describe('VOCABULARY_SET_CAPABILITIES', () => {
  it('defines capabilities for every contract vocabulary set id', () => {
    expect(Object.keys(VOCABULARY_SET_CAPABILITIES).sort()).toEqual(
      [...VOCABULARY_OPTION_SET_IDS].sort(),
    )
  })

  it('satisfies capability implications for every set', () => {
    for (const setId of VOCABULARY_OPTION_SET_IDS) {
      const violations = validateVocabularySetCapabilityImplications(
        VOCABULARY_SET_CAPABILITIES[setId],
      )
      expect(violations, setId).toEqual([])
    }
  })

  it('enables management only for creature-types in this phase', () => {
    expect(vocabularySetIdsRequiringFormDefinition()).toEqual(['creature-types'])
  })

  it('enables browse for every public set and excludes internal-only sets', () => {
    const browsable = vocabularySetIdsWithBrowse()
    expect(browsable).not.toEqual(expect.arrayContaining([...VOCABULARY_INTERNAL_ONLY_SET_IDS]))
    expect(browsable).toContain('creature-types')
    expect(browsable).toContain('damage-types')
    expect(browsable.length).toBe(
      VOCABULARY_OPTION_SET_IDS.length - VOCABULARY_INTERNAL_ONLY_SET_IDS.length,
    )
  })

  it('requires usage resolver registration for every usageResolution set', () => {
    expect(vocabularySetIdsRequiringUsageResolver().sort()).toEqual(
      [...BROWSE_SETS_WITH_USAGE_RESOLUTION].sort(),
    )
  })

  it('requires batch count resolver registration for every batchUsageCounting set', () => {
    expect(vocabularySetIdsRequiringBatchCountResolver().sort()).toEqual(
      [...BROWSE_SETS_WITH_USAGE_RESOLUTION].sort(),
    )
  })

  it('requires form definitions for sets with create or edit', () => {
    expect(vocabularySetIdsRequiringFormDefinition()).toEqual(['creature-types'])
  })
})

describe('validateVocabularySetCapabilityImplications', () => {
  it('flags bulkAvailability without availability', () => {
    const cap: VocabularySetCapability = {
      browse: true,
      create: false,
      edit: false,
      delete: false,
      availability: false,
      bulkAvailability: true,
      usageResolution: false,
      batchUsageCounting: false,
      disableGuard: false,
      deleteGuard: false,
    }
    expect(validateVocabularySetCapabilityImplications(cap).map((v) => v.message)).toContain(
      'bulkAvailability requires availability',
    )
  })

  it('flags management capabilities without browse', () => {
    const cap: VocabularySetCapability = {
      browse: false,
      create: true,
      edit: false,
      delete: false,
      availability: false,
      bulkAvailability: false,
      usageResolution: false,
      batchUsageCounting: false,
      disableGuard: false,
      deleteGuard: false,
    }
    expect(validateVocabularySetCapabilityImplications(cap).map((v) => v.message)).toContain(
      'create requires browse',
    )
  })

  it('flags batchUsageCounting without usageResolution', () => {
    const cap: VocabularySetCapability = {
      browse: true,
      create: false,
      edit: false,
      delete: false,
      availability: false,
      bulkAvailability: false,
      usageResolution: false,
      batchUsageCounting: true,
      disableGuard: false,
      deleteGuard: false,
    }
    expect(validateVocabularySetCapabilityImplications(cap).map((v) => v.message)).toContain(
      'batchUsageCounting requires usageResolution',
    )
  })
})

describe('capability derivation fixture', () => {
  it('activates generic wiring flags from a synthetic capability row without parallel enable lists', () => {
    const fixtureCapabilities = {
      ...VOCABULARY_SET_CAPABILITIES,
      'damage-types': {
        browse: true,
        create: true,
        edit: true,
        delete: true,
        availability: true,
        bulkAvailability: true,
        usageResolution: false,
        batchUsageCounting: false,
        disableGuard: false,
        deleteGuard: false,
      },
    } satisfies Record<(typeof VOCABULARY_OPTION_SET_IDS)[number], VocabularySetCapability>

    expect(
      validateVocabularySetCapabilityImplications(fixtureCapabilities['damage-types']),
    ).toEqual([])
    expect(vocabularySetIdsWithBrowse(fixtureCapabilities).sort()).toEqual(
      expect.arrayContaining(['creature-types', 'damage-types']),
    )
    expect(vocabularySetIdsRequiringFormDefinition(fixtureCapabilities).sort()).toEqual(
      ['creature-types', 'damage-types'].sort(),
    )
    expect(vocabularySetIdsRequiringUsageResolver(fixtureCapabilities).sort()).toEqual(
      vocabularySetIdsRequiringUsageResolver()
        .filter((setId) => setId !== 'damage-types')
        .sort(),
    )
  })
})
