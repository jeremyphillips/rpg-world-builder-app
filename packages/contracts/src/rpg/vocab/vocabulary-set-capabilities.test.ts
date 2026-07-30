import { describe, expect, it } from 'vitest'

import { VOCABULARY_OPTION_SET_IDS } from './vocabulary'
import {
  VOCABULARY_SET_CAPABILITIES,
  type VocabularySetCapability,
  validateVocabularySetCapabilityImplications,
  vocabularySetIdsRequiringFormDefinition,
  vocabularySetIdsRequiringUsageResolver,
  vocabularySetIdsWithHubCard,
  vocabularySetIdsWithOverview,
} from './vocabulary-set-capabilities'

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

  it('enables only creature-types for overview in this phase', () => {
    expect(vocabularySetIdsWithOverview()).toEqual(['creature-types'])
    expect(vocabularySetIdsWithHubCard()).toEqual(['creature-types'])
  })

  it('requires usage resolver registration for creature-types only', () => {
    expect(vocabularySetIdsRequiringUsageResolver()).toEqual(['creature-types'])
  })

  it('requires form definitions for sets with create or edit', () => {
    expect(vocabularySetIdsRequiringFormDefinition()).toEqual(['creature-types'])
  })
})

describe('validateVocabularySetCapabilityImplications', () => {
  it('flags bulkAvailability without availability', () => {
    const cap: VocabularySetCapability = {
      hubCard: true,
      overview: true,
      create: false,
      edit: false,
      delete: false,
      availability: false,
      bulkAvailability: true,
      usageCounting: false,
      disableGuard: false,
      deleteGuard: false,
    }
    expect(validateVocabularySetCapabilityImplications(cap).map((v) => v.message)).toContain(
      'bulkAvailability requires availability',
    )
  })
})

describe('capability derivation fixture', () => {
  it('activates generic wiring flags from a synthetic capability row without parallel enable lists', () => {
    const fixtureCapabilities = {
      ...VOCABULARY_SET_CAPABILITIES,
      'damage-types': {
        hubCard: true,
        overview: true,
        create: true,
        edit: true,
        delete: true,
        availability: true,
        bulkAvailability: true,
        usageCounting: false,
        disableGuard: false,
        deleteGuard: false,
      },
    } satisfies Record<(typeof VOCABULARY_OPTION_SET_IDS)[number], VocabularySetCapability>

    expect(
      validateVocabularySetCapabilityImplications(fixtureCapabilities['damage-types']),
    ).toEqual([])
    expect(vocabularySetIdsWithOverview(fixtureCapabilities).sort()).toEqual(
      ['creature-types', 'damage-types'].sort(),
    )
    expect(vocabularySetIdsRequiringFormDefinition(fixtureCapabilities).sort()).toEqual(
      ['creature-types', 'damage-types'].sort(),
    )
    expect(vocabularySetIdsRequiringUsageResolver(fixtureCapabilities)).toEqual(['creature-types'])
  })
})
