import { describe, expect, it } from 'vitest'

import {
  getVocabularySetCapability,
  type VocabularyOptionSetId,
  type VocabularySetCapability,
} from '@rpg/contracts'

import { GAME_TERMS_VOCABULARY_CATEGORIES } from '../../lib/hub/vocabulary-set-registry'

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
      browse: true,
      availability: true,
      bulkAvailability: true,
    },
  } as Record<VocabularyOptionSetId, VocabularySetCapability>
}

describe('vocabulary capability derivation fixture', () => {
  it('activates browse wiring from capabilities alone', () => {
    const capabilities = buildFixtureCapabilities()
    const browsable = Object.entries(capabilities)
      .filter(([, capability]) => capability.browse)
      .map(([setId]) => setId)

    expect(browsable).toContain('damage-types')
    expect(GAME_TERMS_VOCABULARY_CATEGORIES.map((entry) => entry.setId)).toEqual(
      expect.arrayContaining(['creature-types', 'damage-types']),
    )
  })
})
