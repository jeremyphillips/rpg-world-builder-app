import { describe, expect, it, vi } from 'vitest'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { defineVocabularyUsage } from './define-vocabulary-usage'
import type { VocabularyUsageSource } from './vocabulary-usage-source'

function mockSource(
  index: Map<string, import('@rpg/contracts').ContentUsageBlocker[]>,
): VocabularyUsageSource {
  return {
    loadBlockerIndex: vi.fn(async () => index),
  }
}

describe('defineVocabularyUsage', () => {
  it('derives entry and batch resolvers from source participation flags', async () => {
    const entryOnlySource = mockSource(
      new Map([
        [
          'common',
          [
            {
              kind: 'content',
              contentTypeKey: 'species',
              id: 'sp_1',
              label: 'Elf',
              slug: 'elf',
            },
          ],
        ],
      ]),
    )
    const batchOnlySource = mockSource(
      new Map([
        [
          'common',
          [
            {
              kind: 'content',
              contentTypeKey: 'classes',
              id: 'cl_1',
              label: 'Fighter',
              slug: 'fighter',
            },
          ],
        ],
      ]),
    )

    const registration = defineVocabularyUsage({
      setId: CREATURE_TYPE_SET_ID,
      sources: [
        { source: entryOnlySource, entry: true, batch: false },
        { source: batchOnlySource, entry: false, batch: true },
      ],
      summaryLabels: { singular: 'reference', plural: 'references' },
    })

    const ctx = { campaignId: 'camp_1' }

    const entryResult = await registration.entryResolver(ctx, 'common')
    expect(entryResult.count).toBe(1)
    expect(entryResult.blockers[0]?.kind).toBe('content')
    expect((entryResult.blockers[0] as { contentTypeKey: string }).contentTypeKey).toBe('species')

    const batchResults = await registration.batchResolver(ctx, ['common'])
    const summaryReference = batchResults.get('common')?.summaryReferences[0]
    expect(batchResults.get('common')?.count).toBe(1)
    expect(summaryReference?.kind).toBe('content')
    if (summaryReference?.kind === 'content') {
      expect(summaryReference.contentTypeKey).toBe('classes')
    }
  })

  it('requires at least one entry and one batch source', () => {
    const source = mockSource(new Map())

    expect(() =>
      defineVocabularyUsage({
        setId: CREATURE_TYPE_SET_ID,
        sources: [{ source, entry: false, batch: true }],
        summaryLabels: { singular: 'x', plural: 'xs' },
      }),
    ).toThrow(/entry source/)

    expect(() =>
      defineVocabularyUsage({
        setId: CREATURE_TYPE_SET_ID,
        sources: [{ source, entry: true, batch: false }],
        summaryLabels: { singular: 'x', plural: 'xs' },
      }),
    ).toThrow(/batch source/)
  })
})
