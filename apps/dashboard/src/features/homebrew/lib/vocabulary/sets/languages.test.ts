import { describe, expect, it } from 'vitest'

import { buildActiveLanguageCategoryFieldOptions, buildLanguageVocabulary } from './languages'

describe('buildActiveLanguageCategoryFieldOptions', () => {
  it('derives category chips from active language vocabulary rows', () => {
    const vocabulary = buildLanguageVocabulary({
      options: [
        {
          id: 'common',
          label: 'Common',
          source: 'system',
          status: 'active',
          usedBy: 0,
        },
        {
          id: 'elvish',
          label: 'Elvish',
          source: 'system',
          status: 'active',
          usedBy: 0,
        },
        {
          id: 'abyssal',
          label: 'Abyssal',
          source: 'system',
          status: 'active',
          usedBy: 0,
        },
        {
          id: 'custom-tongue',
          label: 'Custom Tongue',
          source: 'campaign',
          status: 'active',
          usedBy: 0,
        },
      ],
    })

    expect(buildActiveLanguageCategoryFieldOptions(vocabulary)).toEqual([
      { value: 'rare', label: 'Rare' },
      { value: 'standard', label: 'Standard' },
    ])
  })

  it('omits categories for active languages without seed category metadata', () => {
    const vocabulary = buildLanguageVocabulary({
      options: [
        {
          id: 'custom-tongue',
          label: 'Custom Tongue',
          source: 'campaign',
          status: 'active',
          usedBy: 0,
        },
      ],
    })

    expect(buildActiveLanguageCategoryFieldOptions(vocabulary)).toEqual([])
  })
})
