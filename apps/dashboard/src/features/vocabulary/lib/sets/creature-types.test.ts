import { describe, expect, it } from 'vitest'

import {
  buildCreatureTypeVocabulary,
  buildSeedCreatureTypeVocabulary,
  getCreatureTypeLabel,
} from './creature-types'

describe('creature-types vocabulary', () => {
  it('marks every seed creature type as active', () => {
    const vocabulary = buildSeedCreatureTypeVocabulary()
    expect(vocabulary.activeIds.has('humanoid')).toBe(true)
    expect(vocabulary.labelById.humanoid).toBe('Humanoid')
  })

  it('excludes disabled options from activeIds and resolves labels from resolved sets', () => {
    const vocabulary = buildCreatureTypeVocabulary({
      options: [
        {
          id: 'humanoid',
          label: 'People',
          source: 'system',
          status: 'disabled',
          usedBy: 0,
        },
        {
          id: 'robot',
          label: 'Robot',
          source: 'campaign',
          status: 'active',
          usedBy: 0,
        },
      ],
    })

    expect(vocabulary.activeIds.has('humanoid')).toBe(false)
    expect(vocabulary.activeIds.has('robot')).toBe(true)
    expect(getCreatureTypeLabel(vocabulary, 'robot')).toBe('Robot')
    expect(getCreatureTypeLabel(vocabulary, 'missing')).toBe('missing')
  })
})
