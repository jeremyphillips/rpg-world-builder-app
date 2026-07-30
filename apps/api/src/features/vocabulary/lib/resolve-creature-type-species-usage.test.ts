import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../content/content.service', () => ({
  resolveCatalogForCampaign: vi.fn(),
}))

import { resolveCatalogForCampaign } from '../../content/content.service'

import {
  resolveCreatureTypeSpeciesUsage,
  resolveCreatureTypeSpeciesUsageCountsBatch,
} from './resolve-creature-type-species-usage'

const resolveCatalogMock = vi.mocked(resolveCatalogForCampaign)

describe('resolveCreatureTypeSpeciesUsageCountsBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveCatalogMock.mockResolvedValue([
      { id: 'sp_1', name: 'Elf', slug: 'elf', creatureType: 'humanoid' },
      { id: 'sp_2', name: 'Dwarf', slug: 'dwarf', creatureType: 'humanoid' },
      { id: 'sp_3', name: 'Aboleth', slug: 'aboleth', creatureType: 'aberration' },
    ] as unknown as Awaited<ReturnType<typeof resolveCatalogForCampaign>>)
  })

  it('returns counts for multiple entry ids from one catalog load', async () => {
    const counts = await resolveCreatureTypeSpeciesUsageCountsBatch('camp_1', [
      'humanoid',
      'aberration',
      'construct',
    ])

    expect(resolveCatalogMock).toHaveBeenCalledTimes(1)
    expect(counts.get('humanoid')).toBe(2)
    expect(counts.get('aberration')).toBe(1)
    expect(counts.get('construct')).toBe(0)
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
