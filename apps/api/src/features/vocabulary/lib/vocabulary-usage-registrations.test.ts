import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../content/content.service', () => ({
  resolveCatalogForCampaign: vi.fn(),
}))

import { CREATURE_TYPE_SET_ID, LANGUAGE_SET_ID } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../../content'

import {
  resolveVocabularyOptionUsage,
  resolveVocabularyOptionUsageBatch,
} from './vocabulary-usage-resolvers'
import { getVocabularyUsageRegistration } from './vocabulary-usage-registrations'

const resolveCatalogMock = vi.mocked(resolveCatalogForCampaign)
const ctx = { campaignId: 'camp_1' }

describe('creature-types usage via registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveCatalogMock.mockResolvedValue([
      { id: 'sp_1', name: 'Elf', slug: 'elf', creatureType: 'humanoid' },
      { id: 'sp_2', name: 'Dwarf', slug: 'dwarf', creatureType: 'humanoid' },
      { id: 'sp_3', name: 'Aboleth', slug: 'aboleth', creatureType: 'aberration' },
    ] as unknown as Awaited<ReturnType<typeof resolveCatalogForCampaign>>)
  })

  it('returns counts and bounded summary references from one catalog load', async () => {
    const results = await resolveVocabularyOptionUsageBatch(ctx, CREATURE_TYPE_SET_ID, [
      'humanoid',
      'aberration',
      'construct',
    ])

    expect(resolveCatalogMock).toHaveBeenCalledTimes(1)
    expect(results.get('humanoid')).toEqual({
      count: 2,
      summaryReferences: [
        {
          kind: 'content',
          contentTypeKey: 'species',
          id: 'sp_2',
          label: 'Dwarf',
          slug: 'dwarf',
        },
        {
          kind: 'content',
          contentTypeKey: 'species',
          id: 'sp_1',
          label: 'Elf',
          slug: 'elf',
        },
      ],
    })
    expect(results.get('aberration')?.count).toBe(1)
    expect(results.get('construct')).toEqual({ count: 0, summaryReferences: [] })
  })

  it('returns blockers for a single entry', async () => {
    resolveCatalogMock.mockResolvedValue([
      { id: 'sp_1', name: 'Elf', slug: 'elf', creatureType: 'humanoid' },
    ] as unknown as Awaited<ReturnType<typeof resolveCatalogForCampaign>>)

    const result = await resolveVocabularyOptionUsage(ctx, CREATURE_TYPE_SET_ID, 'humanoid')

    expect(result.count).toBe(1)
    expect(result.blockers).toEqual([
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: 'sp_1',
        label: 'Elf',
        slug: 'elf',
        sourceKey: 'unknown',
      },
    ])
  })
})

describe('VOCABULARY_USAGE_REGISTRATIONS overviewUsageScope', () => {
  it('defaults fully batched sets to complete', () => {
    expect(getVocabularyUsageRegistration(CREATURE_TYPE_SET_ID).overviewUsageScope).toBe('complete')
  })

  it('requires content_only for languages entry-only topology', () => {
    expect(getVocabularyUsageRegistration(LANGUAGE_SET_ID).overviewUsageScope).toBe('content_only')
  })

  it('does not change resolver topology when overviewUsageScope differs in a fixture', async () => {
    const source = {
      loadBlockerIndex: vi.fn(async () => new Map([['common', []]])),
    }
    const { defineVocabularyUsage } = await import('./define-vocabulary-usage')

    const completeRegistration = defineVocabularyUsage({
      setId: CREATURE_TYPE_SET_ID,
      sources: [{ source, entry: true, batch: true }],
      summaryLabels: { singular: 'reference', plural: 'references' },
      overviewUsageScope: 'complete',
    })
    const relabeledRegistration = defineVocabularyUsage({
      setId: CREATURE_TYPE_SET_ID,
      sources: [{ source, entry: true, batch: true }],
      summaryLabels: { singular: 'reference', plural: 'references' },
      overviewUsageScope: 'complete',
    })

    relabeledRegistration.overviewUsageScope = 'content_only'

    const ctxFixture = { campaignId: 'camp_1' }
    await completeRegistration.entryResolver(ctxFixture, 'common')
    await relabeledRegistration.entryResolver(ctxFixture, 'common')

    expect(source.loadBlockerIndex).toHaveBeenCalledTimes(2)
  })
})
