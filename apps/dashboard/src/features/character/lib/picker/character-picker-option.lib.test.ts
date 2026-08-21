import { describe, expect, it } from 'vitest'

import {
  buildCharacterPickerOptionEntitySummary,
  buildCharacterPickerOptionSearchText,
  type CharacterPickerOption,
} from './character-picker-option.lib'

const option: CharacterPickerOption = {
  id: 'char-1',
  name: 'Verna',
  summary: 'Dwarf · Level 1 Fighter',
  characterType: 'pc',
  classIds: ['srd-cc-5.2.1:fighter'],
  speciesId: 'srd-cc-5.2.1:dwarf',
}

describe('character-picker-option.lib', () => {
  it('builds entity summary and search text from picker transport', () => {
    const summary = buildCharacterPickerOptionEntitySummary(option)

    expect(summary.name).toBe('Verna')
    expect(summary.identitySummary).toBe('Dwarf · Level 1 Fighter')
    expect(buildCharacterPickerOptionSearchText(option)).toContain('Verna')
    expect(buildCharacterPickerOptionSearchText(option)).toContain('PC')
  })
})
