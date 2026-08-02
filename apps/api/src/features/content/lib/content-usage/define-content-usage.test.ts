import { describe, expect, it, vi } from 'vitest'

import { defineContentUsage } from './define-content-usage'
import type { ContentUsageSource } from './content-usage-source'

function mockSource(
  index: Map<string, import('@rpg/contracts').ContentUsageBlocker[]>,
): ContentUsageSource {
  return {
    loadBlockerIndex: vi.fn(async () => index),
  }
}

describe('defineContentUsage', () => {
  it('derives entry and batch resolvers from source participation flags', async () => {
    const entryOnlySource = mockSource(
      new Map([
        [
          'class-1',
          [
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'char-1',
                label: 'Aria',
                characterType: 'pc',
              },
            },
          ],
        ],
      ]),
    )
    const batchOnlySource = mockSource(
      new Map([
        [
          'class-1',
          [
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'char-2',
                label: 'Borin',
                characterType: 'npc',
                campaignId: 'camp_1',
              },
            },
          ],
        ],
      ]),
    )

    const registration = defineContentUsage({
      contentType: 'classes',
      sources: [
        { source: entryOnlySource, entry: true, batch: false },
        { source: batchOnlySource, entry: false, batch: true },
      ],
      summaryLabels: { singular: 'character', plural: 'characters' },
      overviewUsageScope: 'characters',
      viewerCharacterRelationship: { strategy: 'fixed', kind: 'class' },
    })

    const ctx = { campaignId: 'camp_1' }

    const entryResult = await registration.entryResolver(ctx, 'class-1')
    expect(entryResult.count).toBe(1)
    expect(entryResult.blockers[0]?.kind).toBe('usage')

    const batchResults = await registration.batchResolver(ctx, ['class-1'])
    expect(batchResults.get('class-1')?.count).toBe(1)
    expect(batchResults.get('class-1')?.summaryReferences[0]?.id).toBe('char-2')
  })

  it('requires at least one entry and one batch source', () => {
    const source = mockSource(new Map())

    expect(() =>
      defineContentUsage({
        contentType: 'classes',
        sources: [{ source, entry: false, batch: true }],
        summaryLabels: { singular: 'x', plural: 'xs' },
        viewerCharacterRelationship: { strategy: 'none' },
      }),
    ).toThrow(/entry source/)

    expect(() =>
      defineContentUsage({
        contentType: 'classes',
        sources: [{ source, entry: true, batch: false }],
        summaryLabels: { singular: 'x', plural: 'xs' },
        viewerCharacterRelationship: { strategy: 'none' },
      }),
    ).toThrow(/batch source/)
  })

  it('requires explicit non-complete overviewUsageScope when entry sources exceed batch', () => {
    const batchSource = mockSource(new Map())
    const entryOnlySource = mockSource(new Map())

    expect(() =>
      defineContentUsage({
        contentType: 'classes',
        sources: [
          { source: batchSource, entry: true, batch: true },
          { source: entryOnlySource, entry: true, batch: false },
        ],
        summaryLabels: { singular: 'x', plural: 'xs' },
        viewerCharacterRelationship: { strategy: 'fixed', kind: 'class' },
      }),
    ).toThrow(/overviewUsageScope/)

    expect(() =>
      defineContentUsage({
        contentType: 'classes',
        sources: [
          { source: batchSource, entry: true, batch: true },
          { source: entryOnlySource, entry: true, batch: false },
        ],
        summaryLabels: { singular: 'x', plural: 'xs' },
        overviewUsageScope: 'complete',
        viewerCharacterRelationship: { strategy: 'fixed', kind: 'class' },
      }),
    ).toThrow(/overviewUsageScope/)
  })

  it('defaults fully batched registrations to characters scope', () => {
    const source = mockSource(new Map())
    const registration = defineContentUsage({
      contentType: 'classes',
      sources: [{ source, entry: true, batch: true }],
      summaryLabels: { singular: 'character', plural: 'characters' },
      viewerCharacterRelationship: { strategy: 'fixed', kind: 'class' },
    })
    expect(registration.overviewUsageScope).toBe('characters')
  })

  it('requires hasNoun when viewerCharacterRelationship kind is has', () => {
    const source = mockSource(new Map())

    expect(() =>
      defineContentUsage({
        contentType: 'feats',
        sources: [{ source, entry: true, batch: true }],
        summaryLabels: { singular: 'character', plural: 'characters' },
        viewerCharacterRelationship: { strategy: 'fixed', kind: 'has' },
      }),
    ).toThrow(/hasNoun/)
  })
})
