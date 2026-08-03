import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import { DOCK_WARD, ALDERMERE, LOCATIONS_LIST, HARBORFORD, YAWNING_PORTAL } from '../fixtures'
import {
  buildLocationAncestrySegments,
  buildLocationChildren,
  buildLocationDetailViewModel,
  buildLocationsById,
} from './location-display'

const CAMPAIGN_ID = 'camp_1'

describe('buildLocationAncestrySegments', () => {
  it('walks parent chain root-to-leaf for display', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    const segments = buildLocationAncestrySegments(YAWNING_PORTAL, byId, CAMPAIGN_ID)

    expect(segments.map((segment) => segment.name)).toEqual([
      'Aldermere',
      'Greyshore',
      'Harborford',
      'Dock Ward',
    ])
    expect(segments[0]?.href).toBe(`/campaigns/${CAMPAIGN_ID}/locations/${ALDERMERE.id}`)
  })

  it('returns empty ancestry for a root location', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    expect(buildLocationAncestrySegments(ALDERMERE, byId, CAMPAIGN_ID)).toEqual([])
  })

  it('stops when a cycle is detected', () => {
    const locationA: Location = {
      ...ALDERMERE,
      id: 'location-cycle-a',
      slug: 'cycle-a',
      name: 'Cycle A',
      parentLocationId: 'location-cycle-b',
    }
    const locationB: Location = {
      ...ALDERMERE,
      id: 'location-cycle-b',
      slug: 'cycle-b',
      name: 'Cycle B',
      parentLocationId: 'location-cycle-a',
    }
    const byId = buildLocationsById([locationA, locationB])
    const segments = buildLocationAncestrySegments(locationA, byId, CAMPAIGN_ID)

    expect(segments.map((segment) => segment.id)).toEqual(['location-cycle-b'])
  })
})

describe('buildLocationChildren', () => {
  it('returns direct children sorted by name', () => {
    const children = buildLocationChildren(HARBORFORD.id, LOCATIONS_LIST, CAMPAIGN_ID)
    expect(children.map((child) => child.name)).toEqual(['Dock Ward'])
    expect(children[0]?.kindLabel).toBe('District')
  })
})

describe('buildLocationDetailViewModel', () => {
  it('includes kind, subtype, parent, ancestry, and children', () => {
    const viewModel = buildLocationDetailViewModel(HARBORFORD, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
    })

    expect(viewModel.statRows.map((row) => row.label)).toEqual(['Kind', 'Subtype', 'Parent'])
    expect(viewModel.statRows[1]?.value).toBe('City')
    expect(viewModel.statRows[2]?.value).toBe('Greyshore')
    expect(viewModel.ancestry.map((segment) => segment.name)).toEqual(['Aldermere', 'Greyshore'])
    expect(viewModel.children.items.map((child) => child.name)).toEqual(['Dock Ward'])
  })

  it('shows building archetype classification in the subtype row', () => {
    const viewModel = buildLocationDetailViewModel(YAWNING_PORTAL, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
    })

    expect(viewModel.statRows.map((row) => row.label)).toEqual(['Kind', 'Subtype', 'Parent'])
    expect(viewModel.statRows[1]?.value).toBe('Building · Tavern')
  })

  it('omits subtype row when unset', () => {
    const viewModel = buildLocationDetailViewModel(DOCK_WARD, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
    })

    expect(viewModel.statRows.map((row) => row.label)).toEqual(['Kind', 'Parent'])
  })
})
