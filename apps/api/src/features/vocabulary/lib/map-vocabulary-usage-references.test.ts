import { describe, expect, it } from 'vitest'

import {
  buildVocabularyEntryUsageFromBlockers,
  sortVocabularyUsageReferences,
} from './map-vocabulary-usage-references'

describe('map-vocabulary-usage-references', () => {
  it('derives usedBy from references length', () => {
    const usage = buildVocabularyEntryUsageFromBlockers([
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: 'species-1',
        label: 'Elf',
        slug: 'elf',
      },
    ])

    expect(usage.usedBy).toBe(1)
    expect(usage.references).toHaveLength(1)
  })

  it('sorts content references by content type then label', () => {
    const sorted = sortVocabularyUsageReferences([
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: '2',
        label: 'Zebrafolk',
        slug: 'zebrafolk',
      },
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: '1',
        label: 'Aarakocra',
        slug: 'aarakocra',
      },
      {
        kind: 'character',
        id: 'pc-1',
        label: 'Bob',
        characterType: 'pc',
      },
    ])

    expect(sorted.map((reference) => reference.label)).toEqual(['Aarakocra', 'Zebrafolk', 'Bob'])
  })
})
