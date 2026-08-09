import { describe, expect, it } from 'vitest'

import { HARBORFORD, DOCK_WARD, YAWNING_PORTAL } from '../fixtures'
import { childAuthoringTypesForParentKind } from './location-create-shortcuts'
import {
  isDirectPlaceAuthoringTypeForSettlement,
  isDistrictAuthoringTypeForSettlement,
  partitionLocationsByStructureGroup,
  resolveLocationStructureProfile,
  resolveStructureChildAuthoringOptions,
} from './location-structure.lib'

describe('partitionLocationsByStructureGroup (settlement)', () => {
  it('groups districts separately from direct places', () => {
    const profile = resolveLocationStructureProfile('settlement')
    expect(profile).toBeDefined()
    const { districts, directLocations } = partitionLocationsByStructureGroup(
      [DOCK_WARD, YAWNING_PORTAL],
      profile!,
    )

    expect(districts.map((location) => location.id)).toEqual([DOCK_WARD.id])
    expect(directLocations.map((location) => location.id)).toEqual([YAWNING_PORTAL.id])
  })
})

describe('settlement child eligibility helpers', () => {
  it('maps authoring types to district vs direct-place buckets', () => {
    expect(isDistrictAuthoringTypeForSettlement('district')).toBe(true)
    expect(isDirectPlaceAuthoringTypeForSettlement('building')).toBe(true)
    expect(isDirectPlaceAuthoringTypeForSettlement('district')).toBe(false)
  })

  it('projects canonical settlement eligibility into structure authoring options', () => {
    const eligible = childAuthoringTypesForParentKind('settlement')
    const options = resolveStructureChildAuthoringOptions('settlement', eligible)

    expect(options.structural).toBe('district')
    expect(options.direct).not.toContain('district')
    expect(options.direct).toEqual(eligible.filter((type) => type !== 'district'))
    expect(options.direct).toEqual(
      expect.arrayContaining(['building', 'site', 'fortification', 'structure']),
    )
  })

  it('omits district when it is not in the eligible set', () => {
    expect(resolveStructureChildAuthoringOptions('settlement', ['building', 'site'])).toEqual({
      structural: undefined,
      direct: ['building', 'site'],
    })
  })
})

describe('settlement structure on Harborford', () => {
  it('uses settlement type in structure heading via display vm', async () => {
    const { buildLocationDetailViewModel } = await import('./location-display')
    const viewModel = buildLocationDetailViewModel(HARBORFORD, {
      locations: [HARBORFORD, DOCK_WARD, YAWNING_PORTAL],
      campaignId: 'camp_1',
    })

    expect(viewModel.children.heading).toBe('City structure')
    expect(viewModel.children.groups?.map((group) => group.id)).toEqual([
      'districts',
      'directLocations',
    ])
  })
})
