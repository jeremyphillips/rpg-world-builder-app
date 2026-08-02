import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../content/content.service', () => ({
  resolveCatalogForCampaign: vi.fn(),
}))

import { resolveCatalogForCampaign } from '../../content/content.service'

import {
  resolveCreatureTypeSpeciesUsage,
  resolveCreatureTypeSpeciesUsageBatch,
} from './resolve-creature-type-species-usage'

const resolveCatalogMock = vi.mocked(resolveCatalogForCampaign)

describe('resolveCreatureTypeSpeciesUsageBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveCatalogMock.mockResolvedValue([
      { id: 'sp_1', name: 'Elf', slug: 'elf', creatureType: 'humanoid' },
      { id: 'sp_2', name: 'Dwarf', slug: 'dwarf', creatureType: 'humanoid' },
      { id: 'sp_3', name: 'Aboleth', slug: 'aboleth', creatureType: 'aberration' },
    ] as unknown as Awaited<ReturnType<typeof resolveCatalogForCampaign>>)
  })

  it('returns counts and bounded summary references from one catalog load', async () => {
    const results = await resolveCreatureTypeSpeciesUsageBatch('camp_1', [
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
})

describe('resolveCreatureTypeSpeciesUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveCatalogMock.mockResolvedValue([
      { id: 'sp_1', name: 'Elf', slug: 'elf', creatureType: 'humanoid' },
    ] as unknown as Awaited<ReturnType<typeof resolveCatalogForCampaign>>)
  })

  it('returns blockers for a single entry', async () => {
    const result = await resolveCreatureTypeSpeciesUsage('camp_1', 'humanoid')

    expect(result.count).toBe(1)
    expect(result.blockers).toEqual([
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: 'sp_1',
        label: 'Elf',
        slug: 'elf',
      },
    ])
  })
})
