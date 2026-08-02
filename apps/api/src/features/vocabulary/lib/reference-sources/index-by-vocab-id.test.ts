import { describe, expect, it } from 'vitest'

import { indexRecordsByVocabId, mergeBlockerIndexes } from './index-by-vocab-id'

describe('indexRecordsByVocabId', () => {
  it('dedupes the same referrer across multiple vocab edges on one record', () => {
    const index = indexRecordsByVocabId(
      [{ id: 'sp_1', name: 'Elf', slug: 'elf', languages: ['common', 'elvish'] }],
      (record) => record.languages,
      (record) => ({
        kind: 'content',
        contentTypeKey: 'species',
        id: record.id,
        label: record.name,
        slug: record.slug,
      }),
    )

    expect(index.get('common')).toHaveLength(1)
    expect(index.get('elvish')).toHaveLength(1)
  })

  it('counts two species referencing the same language separately', () => {
    const index = indexRecordsByVocabId(
      [
        { id: 'sp_1', name: 'Elf', slug: 'elf', languages: ['common'] },
        { id: 'sp_2', name: 'Human', slug: 'human', languages: ['common'] },
      ],
      (record) => record.languages,
      (record) => ({
        kind: 'content',
        contentTypeKey: 'species',
        id: record.id,
        label: record.name,
        slug: record.slug,
      }),
    )

    expect(index.get('common')).toHaveLength(2)
  })
})

describe('mergeBlockerIndexes', () => {
  it('dedupes the same referrer across composed source indexes', () => {
    const speciesIndex = new Map([
      [
        'common',
        [
          {
            kind: 'content' as const,
            contentTypeKey: 'species' as const,
            id: 'sp_1',
            label: 'Elf',
            slug: 'elf',
          },
        ],
      ],
    ])
    const classIndex = new Map([
      [
        'common',
        [
          {
            kind: 'content' as const,
            contentTypeKey: 'classes' as const,
            id: 'cl_1',
            label: 'Wizard',
            slug: 'wizard',
          },
        ],
      ],
    ])

    const merged = mergeBlockerIndexes([speciesIndex, classIndex])
    expect(merged.get('common')).toHaveLength(2)
  })
})
