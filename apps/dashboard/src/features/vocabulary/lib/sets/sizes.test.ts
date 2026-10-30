import { describe, expect, it } from 'vitest'

import { buildActiveSizeFieldOptions, type SizeVocabulary } from './sizes'

const vocabulary: SizeVocabulary = {
  labelById: {
    tiny: 'Tiny',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    huge: 'Huge',
    gargantuan: 'Gargantuan',
  },
  activeIds: new Set(['tiny', 'medium', 'large', 'huge', 'gargantuan']),
}

describe('buildActiveSizeFieldOptions', () => {
  it('orders active sizes by descending rank in one pass', () => {
    expect(buildActiveSizeFieldOptions(vocabulary).map((option) => option.value)).toEqual([
      'gargantuan',
      'huge',
      'large',
      'medium',
      'tiny',
    ])
  })

  it('keeps a saved inactive size visible and omits an inactive size that is not saved', () => {
    const options = buildActiveSizeFieldOptions(vocabulary, ['small', 'medium'])
    expect(options.map((option) => option.value)).toEqual([
      'gargantuan',
      'huge',
      'large',
      'medium',
      'small',
      'tiny',
    ])
    expect(options.find((option) => option.value === 'small')?.label).toBe('Small')
  })
})
