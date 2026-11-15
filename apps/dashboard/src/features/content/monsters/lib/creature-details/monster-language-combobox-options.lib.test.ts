import { describe, expect, it } from 'vitest'

import { prepareMonsterLanguageComboboxOptions } from './monster-language-combobox-options.lib'

describe('prepareMonsterLanguageComboboxOptions', () => {
  const options = [
    { value: 'draconic', label: 'Draconic' },
    { value: 'common', label: 'Common' },
    { value: 'infernal', label: 'Infernal' },
  ]

  it('orders unselected affinity languages first with recommendation metadata', () => {
    const prepared = prepareMonsterLanguageComboboxOptions({
      activeLanguageOptions: options,
      selectedLanguageIds: new Set(),
      affinityLanguageIds: ['draconic'],
      creatureTypeLabel: 'Dragon',
    })

    expect(prepared.map((option) => option.value)).toEqual(['draconic', 'common', 'infernal'])
    expect(prepared[0]?.metadata).toBe('Recommended by Dragon')
  })

  it('skips selected languages and does not attach recommendation metadata to them', () => {
    const prepared = prepareMonsterLanguageComboboxOptions({
      activeLanguageOptions: options,
      selectedLanguageIds: new Set(['draconic']),
      affinityLanguageIds: ['draconic'],
      creatureTypeLabel: 'Dragon',
    })

    expect(prepared.map((option) => option.value)).toEqual(['common', 'infernal'])
  })

  it('preserves existing option metadata', () => {
    const prepared = prepareMonsterLanguageComboboxOptions({
      activeLanguageOptions: [{ value: 'draconic', label: 'Draconic', metadata: 'Rare' }],
      selectedLanguageIds: new Set(),
      affinityLanguageIds: ['draconic'],
      creatureTypeLabel: 'Dragon',
    })

    expect(prepared[0]?.metadata).toBe('Rare')
  })

  it('returns the base order when no creature type label is provided', () => {
    const prepared = prepareMonsterLanguageComboboxOptions({
      activeLanguageOptions: options,
      selectedLanguageIds: new Set(),
      affinityLanguageIds: ['draconic'],
    })

    expect(prepared).toEqual(options)
  })
})
