import { describe, expect, it } from 'vitest'

import { ALDERMERE, GREYSHORE, HARBORFORD } from '../fixtures'
import {
  formatLocationStructureSplitCount,
  partitionImmediateRegionChildCounts,
  partitionLocationsByStructureGroup,
  resolveLocationStructureProfile,
  resolveStructureChildAuthoringOptions,
} from './location-structure.lib'
import { childAuthoringTypesForParentKind } from './create/location-create-shortcuts'
import { buildLocationDetailViewModel } from './location-display'

describe('resolveLocationStructureProfile', () => {
  it('defines world, region, and settlement grouped profiles', () => {
    expect(resolveLocationStructureProfile('world')?.groups.map((group) => group.id)).toEqual([
      'regions',
      'directLocations',
    ])
    expect(resolveLocationStructureProfile('region')?.groups.map((group) => group.id)).toEqual([
      'subregions',
      'directLocations',
    ])
    expect(resolveLocationStructureProfile('settlement')?.groups.map((group) => group.id)).toEqual([
      'districts',
      'directLocations',
    ])
    expect(resolveLocationStructureProfile('world')?.groups[0]?.maxInlineDepth).toBe(2)
    expect(resolveLocationStructureProfile('settlement')?.groups[0]?.maxInlineDepth).toBe(1)
  })
})

describe('partitionLocationsByStructureGroup', () => {
  it('buckets world children into regions and direct locations', () => {
    const profile = resolveLocationStructureProfile('world')!
    const buckets = partitionLocationsByStructureGroup([GREYSHORE, HARBORFORD], profile)

    expect(buckets.regions.map((location) => location.id)).toEqual([GREYSHORE.id])
    expect(buckets.directLocations.map((location) => location.id)).toEqual([HARBORFORD.id])
  })
})

describe('formatLocationStructureSplitCount', () => {
  it('splits immediate region vs non-region counts with parent-aware nouns', () => {
    const formatCount = (count: number, singular: string, plural: string) =>
      `${count} ${count === 1 ? singular : plural}`

    expect(formatLocationStructureSplitCount([GREYSHORE, HARBORFORD], 'region', formatCount)).toBe(
      '1 subregion · 1 location',
    )

    expect(formatLocationStructureSplitCount([GREYSHORE, HARBORFORD], 'world', formatCount)).toBe(
      '1 region · 1 location',
    )
  })

  it('omits zero buckets', () => {
    expect(partitionImmediateRegionChildCounts([HARBORFORD])).toEqual({
      regionCount: 0,
      locationCount: 1,
    })
  })
})

describe('resolveStructureChildAuthoringOptions', () => {
  it('projects region eligibility into subregion vs direct buckets', () => {
    const eligible = childAuthoringTypesForParentKind('region')
    const options = resolveStructureChildAuthoringOptions('region', eligible)

    expect(options.structural).toBe('region')
    expect(options.direct).not.toContain('region')
    expect(options.direct).toEqual(expect.arrayContaining(['settlement', 'site']))
  })
})

describe('world and region structure view models', () => {
  it('builds World structure with regions group', () => {
    const viewModel = buildLocationDetailViewModel(ALDERMERE, {
      locations: [ALDERMERE, GREYSHORE, HARBORFORD],
      campaignId: 'camp_1',
    })

    expect(viewModel.children.heading).toBe('World structure')
    expect(viewModel.children.groups?.map((group) => group.id)).toEqual([
      'regions',
      'directLocations',
    ])
    expect(viewModel.children.groups?.[0]?.label).toBe('Regions')
    expect(viewModel.children.groups?.[0]?.expandableItems?.[0]?.item.name).toBe('Greyshore')
    expect(viewModel.children.groups?.[0]?.expandableItems?.[0]?.disclosure).toBe(true)
  })

  it('builds Region structure with Subregions label', () => {
    const nested = {
      ...GREYSHORE,
      id: 'location-northern-marches',
      name: 'Northern Marches',
      parentLocationId: GREYSHORE.id,
    }
    const viewModel = buildLocationDetailViewModel(GREYSHORE, {
      locations: [ALDERMERE, GREYSHORE, nested, HARBORFORD],
      campaignId: 'camp_1',
    })

    expect(viewModel.children.heading).toBe('Region structure')
    expect(viewModel.children.groups?.map((group) => group.id)).toEqual([
      'subregions',
      'directLocations',
    ])
    expect(viewModel.children.groups?.[0]?.label).toBe('Subregions')
    expect(viewModel.children.groups?.[1]?.items.map((item) => item.name)).toEqual(['Harborford'])
  })
})
