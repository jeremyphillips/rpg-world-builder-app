import { describe, expect, it } from 'vitest'

import {
  buildLabelDescriptionActiveVocabulary,
  buildVocabularyFromSeedSet,
} from '@/features/vocabulary'
import { DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE, SENSE_SET_ID } from '@rpg/contracts'

import {
  parseSpeciesTraitAcquisitionId,
  SPECIES_SENSE_MISSING_DESCRIPTION_MESSAGE,
  SPECIES_SENSE_VOCABULARY_READINESS_MESSAGE,
  speciesTraitAcquisitionDropdownItems,
} from './species-trait-acquisition'
import type { TraitRowForm } from './species-trait-form-fields'

const seedSenseVocabulary = buildVocabularyFromSeedSet(
  SENSE_SET_ID,
  buildLabelDescriptionActiveVocabulary,
)

describe('speciesTraitAcquisitionDropdownItems', () => {
  it('disables a duplicate sense with the occurrence message', () => {
    const traits: TraitRowForm[] = [
      {
        kind: 'template',
        id: 'darkvision',
        templateId: 'sense-darkvision',
        config: { range: 60 },
        grants: [],
        overrideDisplay: false,
        available: true,
      },
    ]
    const items = speciesTraitAcquisitionDropdownItems({
      rulesetId: 'srd-cc-5.2.1',
      traits,
      senseVocabulary: seedSenseVocabulary,
      senseVocabularyStatus: 'ready',
    })
    const darkvision = items.find((item) => item.label === 'Darkvision')
    expect(darkvision?.id).toBe('template:sense-darkvision')
    expect(darkvision?.disabled).toBe(true)
    expect(darkvision?.disabledReason).toBe(DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE)
    expect(darkvision?.groupId).toBe('senses')
  })

  it('exposes template and custom descriptions', () => {
    const items = speciesTraitAcquisitionDropdownItems({
      rulesetId: 'srd-cc-5.2.1',
      traits: [],
      senseVocabulary: seedSenseVocabulary,
      senseVocabularyStatus: 'ready',
    })
    expect(parseSpeciesTraitAcquisitionId('template:sense-blindsight')).toEqual({
      type: 'template',
      templateId: 'sense-blindsight',
    })
    expect(items.find((item) => item.id === 'template:magic-resistance')?.metadata).toContain(
      'Advantage on saving throws',
    )
    expect(items.find((item) => item.id === 'custom')?.metadata).toBe(
      'Write a name and description.',
    )
  })

  it('blocks sense rows when vocabulary is not ready', () => {
    const items = speciesTraitAcquisitionDropdownItems({
      rulesetId: 'srd-cc-5.2.1',
      traits: [],
      senseVocabularyStatus: 'pending',
    })
    const darkvision = items.find((item) => item.label === 'Darkvision')
    expect(darkvision?.disabled).toBe(true)
    expect(darkvision?.disabledReason).toBe(SPECIES_SENSE_VOCABULARY_READINESS_MESSAGE)
  })

  it('surfaces unresolved sense copy for blank vocabulary descriptions', () => {
    const items = speciesTraitAcquisitionDropdownItems({
      rulesetId: 'srd-cc-5.2.1',
      traits: [],
      senseVocabulary: {
        ...seedSenseVocabulary,
        descriptionById: {
          ...seedSenseVocabulary.descriptionById,
          'custom-sense-id': '',
        },
      },
      senseVocabularyStatus: 'ready',
    })
    expect(SPECIES_SENSE_MISSING_DESCRIPTION_MESSAGE).toBeTruthy()
    expect(
      items.some((item) => item.metadata === SPECIES_SENSE_MISSING_DESCRIPTION_MESSAGE),
    ).toBeTypeOf('boolean')
  })
})
