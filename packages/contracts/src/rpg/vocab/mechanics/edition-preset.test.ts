import { describe, expect, it } from 'vitest'

import {
  EDITION_PRESET_DISPLAY_ORDER,
  EDITION_PRESET_IDS,
  getEditionPresetLabel,
  getEditionPresetSentenceForm,
  sortEditionPresetIds,
} from './edition-preset'

describe('edition preset display order', () => {
  it('includes every edition preset id', () => {
    expect([...EDITION_PRESET_DISPLAY_ORDER].sort()).toEqual([...EDITION_PRESET_IDS].sort())
  })

  it('sorts ids from most recent era to oldest', () => {
    expect(sortEditionPresetIds(['becmi', '3e', '5e', '1e', '2e'])).toEqual([
      '5e',
      '3e',
      '2e',
      '1e',
      'becmi',
    ])
  })
})

describe('edition preset vocabulary', () => {
  it('derives labels from entries', () => {
    expect(getEditionPresetLabel('5e')).toBe('Modern 5e')
  })

  it('returns edition preset sentence forms', () => {
    expect(getEditionPresetSentenceForm('5e')).toBe('modern 5e rules')
    expect(getEditionPresetSentenceForm('becmi')).toBe('classic basic rules')
  })
})
