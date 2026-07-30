import { describe, expect, it } from 'vitest'

import {
  getVocabularySetCapability,
  type VocabularyOptionSetId,
  type VocabularySetCapability,
} from '@rpg/contracts'

import { ENABLED_VOCABULARY_SET_IDS } from '../../lib/hub/vocabulary-set-registry'

/** Synthetic capability row used to verify generic wiring without editing production lists. */
function buildFixtureCapabilities(): Record<VocabularyOptionSetId, VocabularySetCapability> {
  const base = getVocabularySetCapability('damage-types')
  return {
    ...Object.fromEntries(
      (['creature-types', 'damage-types'] as const).map((setId) => [
        setId,
        getVocabularySetCapability(setId),
      ]),
    ),
    'damage-types': {
      ...base,
      hubCard: true,
      overview: true,
      availability: true,
      bulkAvailability: true,
    },
  } as Record<VocabularyOptionSetId, VocabularySetCapability>
}

describe('vocabulary capability derivation fixture', () => {
  it('activates overview wiring from capabilities alone', () => {
    const capabilities = buildFixtureCapabilities()
    const enabled = Object.entries(capabilities)
      .filter(([, capability]) => capability.overview)
      .map(([setId]) => setId)

    expect(enabled).toContain('damage-types')
    expect(enabled).toEqual(expect.arrayContaining([...ENABLED_VOCABULARY_SET_IDS]))
  })
})
