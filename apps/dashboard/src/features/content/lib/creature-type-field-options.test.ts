import { describe, expect, it } from 'vitest'

import {
  allowedCharacterCreatureTypesFromCtx,
  getCharacterCreatureTypeFieldOptions,
} from './creature-type-field-options'

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
        },
      }),
    ).toEqual([
      { value: 'humanoid', label: 'Humanoid' },
      { value: 'fey', label: 'Fey' },
    ])
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
        },
      }),
    ).toEqual(['construct'])
  })
})
