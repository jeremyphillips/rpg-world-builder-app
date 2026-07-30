import { describe, expect, it } from 'vitest'
import {
  VOCABULARY_OPTION_SET_IDS,
  VOCABULARY_SET_CAPABILITIES,
  validateVocabularySetCapabilityImplications,
  vocabularySetIdsRequiringFormDefinition,
  vocabularySetIdsRequiringUsageResolver,
  vocabularySetIdsWithOverview,
} from '@rpg/contracts'

import {
  VOCABULARY_SET_INTEGRATION_MANIFEST,
  integrationManifestEntries,
  vocabularySetIdsWithManifestExtension,
} from './index'

describe('VOCABULARY_SET_INTEGRATION_MANIFEST', () => {
  it('covers every contract vocabulary set id exactly once', () => {
    expect(Object.keys(VOCABULARY_SET_INTEGRATION_MANIFEST).sort()).toEqual(
      [...VOCABULARY_OPTION_SET_IDS].sort(),
    )
  })

  it('documents usage resolver extension for sets requiring API resolver coverage', () => {
    expect(vocabularySetIdsWithManifestExtension('usageResolver').sort()).toEqual(
      vocabularySetIdsRequiringUsageResolver().sort(),
    )
  })

  it('documents form definition extension for sets requiring dashboard forms', () => {
    expect(vocabularySetIdsWithManifestExtension('formDefinition').sort()).toEqual(
      vocabularySetIdsRequiringFormDefinition().sort(),
    )
  })

  it('documents overview shell extension for overview-capable sets', () => {
    expect(vocabularySetIdsWithManifestExtension('overviewShell').sort()).toEqual(
      vocabularySetIdsWithOverview().sort(),
    )
  })

  it('assigns an owner to every manifest entry', () => {
    for (const [setId, entry] of integrationManifestEntries()) {
      expect(entry.owner, setId).toBeTruthy()
    }
  })
})

describe('capability ↔ manifest coverage', () => {
  it('requires manifest usageResolver note when any usage capability is enabled', () => {
    for (const setId of vocabularySetIdsRequiringUsageResolver()) {
      const entry = VOCABULARY_SET_INTEGRATION_MANIFEST[setId]
      expect(entry.extensionPoints?.usageResolver, setId).toBe(true)
    }
  })

  it('requires manifest formDefinition note when create or edit is enabled', () => {
    for (const setId of vocabularySetIdsRequiringFormDefinition()) {
      const entry = VOCABULARY_SET_INTEGRATION_MANIFEST[setId]
      expect(entry.extensionPoints?.formDefinition, setId).toBe(true)
    }
  })

  it('requires manifest overviewShell note when overview is enabled', () => {
    for (const setId of vocabularySetIdsWithOverview()) {
      const entry = VOCABULARY_SET_INTEGRATION_MANIFEST[setId]
      expect(entry.extensionPoints?.overviewShell, setId).toBe(true)
    }
  })

  it('does not mark usageResolver on sets with all usage capabilities disabled', () => {
    for (const setId of VOCABULARY_OPTION_SET_IDS) {
      const caps = VOCABULARY_SET_CAPABILITIES[setId]
      const needsResolver = caps.usageCounting || caps.disableGuard || caps.deleteGuard
      const entry = VOCABULARY_SET_INTEGRATION_MANIFEST[setId]
      const manifestFlag = entry.extensionPoints?.usageResolver === true

      expect(manifestFlag, setId).toBe(needsResolver)
    }
  })

  it('satisfies capability implications for the production matrix', () => {
    for (const setId of VOCABULARY_OPTION_SET_IDS) {
      expect(
        validateVocabularySetCapabilityImplications(VOCABULARY_SET_CAPABILITIES[setId]),
      ).toEqual([])
    }
  })
})
