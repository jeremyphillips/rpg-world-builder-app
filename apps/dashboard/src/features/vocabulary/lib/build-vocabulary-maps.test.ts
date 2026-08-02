import { describe, expect, it } from 'vitest'

import {
  buildLabelActiveVocabulary,
  buildLabelDescriptionActiveVocabulary,
} from './build-vocabulary-maps'

describe('buildLabelActiveVocabulary', () => {
  it('maps labels and active ids from resolved options', () => {
    const vocabulary = buildLabelActiveVocabulary({
      options: [
        {
          id: 'humanoid',
          label: 'Humanoid',
          source: 'system',
          status: 'active',
          usedBy: 0,
        },
        {
          id: 'fey',
          label: 'Fey',
          source: 'system',
          status: 'disabled',
          usedBy: 0,
        },
      ],
    })

    expect(vocabulary.labelById.humanoid).toBe('Humanoid')
    expect(vocabulary.activeIds.has('humanoid')).toBe(true)
    expect(vocabulary.activeIds.has('fey')).toBe(false)
  })
})

describe('buildLabelDescriptionActiveVocabulary', () => {
  it('includes descriptions alongside labels and active ids', () => {
    const vocabulary = buildLabelDescriptionActiveVocabulary({
      options: [
        {
          id: '5e',
          label: 'Modern 5e',
          description: 'Modern fantasy rules.',
          source: 'system',
          status: 'active',
          usedBy: 0,
        },
      ],
    })

    expect(vocabulary.descriptionById['5e']).toBe('Modern fantasy rules.')
    expect(vocabulary.activeIds.has('5e')).toBe(true)
  })
})
