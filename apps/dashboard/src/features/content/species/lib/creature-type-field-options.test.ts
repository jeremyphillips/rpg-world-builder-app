import { describe, expect, it } from 'vitest'
import { defaultMulticlassingRules, defaultSubclassingRules } from '@rpg/contracts'

import { buildSeedCreatureTypeVocabulary } from '@/features/homebrew'

import {
  allowedCharacterCreatureTypesFromCtx,
  getCharacterCreatureTypeFieldOptions,
  getCreatureTypeLabel,
} from './creature-type-field-options'

const seedVocabulary = buildSeedCreatureTypeVocabulary()

describe('getCharacterCreatureTypeFieldOptions', () => {
  it('defaults to humanoid when campaign rules are absent', () => {
    expect(getCharacterCreatureTypeFieldOptions()).toEqual([
      { value: 'humanoid', label: 'Humanoid' },
    ])
  })

  it('returns all allowed types from campaign rules', () => {
    expect(
      getCharacterCreatureTypeFieldOptions({
        campaignRules: {
          maxCharacterLevel: 20,
          standardMaxCharacterLevel: 20,
          allowedCharacterCreatureTypes: ['humanoid', 'fey'],
          multiclassing: defaultMulticlassingRules(),
          subclassing: defaultSubclassingRules(),
        },
        creatureTypeVocabulary: seedVocabulary,
      }),
    ).toEqual([
      { value: 'humanoid', label: 'Humanoid' },
      { value: 'fey', label: 'Fey' },
    ])
  })

  it('omits allowed types that are disabled in campaign vocabulary', () => {
    const vocabulary = {
      labelById: { humanoid: 'Humanoid', fey: 'Fey' },
      activeIds: new Set(['humanoid']),
    }

    expect(
      getCharacterCreatureTypeFieldOptions({
        campaignRules: {
          maxCharacterLevel: 20,
          standardMaxCharacterLevel: 20,
          allowedCharacterCreatureTypes: ['humanoid', 'fey'],
          multiclassing: defaultMulticlassingRules(),
          subclassing: defaultSubclassingRules(),
        },
        creatureTypeVocabulary: vocabulary,
      }),
    ).toEqual([{ value: 'humanoid', label: 'Humanoid' }])
  })
})

describe('allowedCharacterCreatureTypesFromCtx', () => {
  it('reads allowed types from ctx', () => {
    expect(
      allowedCharacterCreatureTypesFromCtx({
        campaignRules: {
          maxCharacterLevel: 20,
          standardMaxCharacterLevel: 20,
          allowedCharacterCreatureTypes: ['construct'],
          multiclassing: defaultMulticlassingRules(),
          subclassing: defaultSubclassingRules(),
        },
      }),
    ).toEqual(['construct'])
  })
})

describe('getCreatureTypeLabel', () => {
  it('uses campaign vocabulary labels when provided', () => {
    expect(
      getCreatureTypeLabel('fey', {
        creatureTypeVocabulary: {
          labelById: { fey: 'Custom Fey' },
          activeIds: new Set(['fey']),
        },
      }),
    ).toBe('Custom Fey')
  })
})
