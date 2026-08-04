import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import { DOCK_WARD, ALDERMERE, LOCATIONS_LIST, HARBORFORD, YAWNING_PORTAL } from '../fixtures'
import {
  buildChildCountByParentId,
  buildChildSummariesByParentId,
  buildLocationChildren,
  buildLocationDetailViewModel,
  buildLocationLocatedInSegments,
  buildLocationsById,
  LOCATION_UNKNOWN_ANCESTOR_LABEL,
} from './location-display'

const CAMPAIGN_ID = 'camp_1'

describe('buildLocationLocatedInSegments', () => {
  it('walks parent chain root-to-leaf for display', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    const segments = buildLocationLocatedInSegments(YAWNING_PORTAL, byId, CAMPAIGN_ID)

    expect(segments.map((segment) => segment.name)).toEqual([
      'Aldermere',
      'Greyshore',
      'Harborford',
      'Dock Ward',
    ])
    expect(segments[0]?.href).toBe(`/campaigns/${CAMPAIGN_ID}/locations/${ALDERMERE.id}`)
  })

  it('returns empty located-in for a root location', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    expect(buildLocationLocatedInSegments(ALDERMERE, byId, CAMPAIGN_ID)).toEqual([])
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
    const segments = buildLocationLocatedInSegments(locationA, byId, CAMPAIGN_ID)

    expect(segments.map((segment) => segment.id)).toEqual(['location-cycle-b'])
  })

  it('emits neutral plain-text segment for orphaned parent references', () => {
    const orphan: Location = {
      ...HARBORFORD,
      id: 'location-orphan',
      slug: 'orphan',
      name: 'Orphan',
      parentLocationId: 'missing-parent-id',
    }
    const byId = buildLocationsById([orphan])
    const segments = buildLocationLocatedInSegments(orphan, byId, CAMPAIGN_ID)

    expect(segments).toEqual([
      {
        id: 'missing-parent-id',
        name: LOCATION_UNKNOWN_ANCESTOR_LABEL,
      },
    ])
  })
})

describe('buildLocationChildren', () => {
  it('returns direct children sorted by name with compact summary lines', () => {
    const children = buildLocationChildren(HARBORFORD.id, LOCATIONS_LIST, CAMPAIGN_ID)
    expect(children.map((child) => child.name)).toEqual(['Dock Ward'])
    expect(children[0]?.summaryLine).toBe('District')
  })
})

describe('buildChildCountByParentId', () => {
  it('counts direct child locations only', () => {
    const summaries = buildChildSummariesByParentId(LOCATIONS_LIST)
    const counts = buildChildCountByParentId(LOCATIONS_LIST)
    expect(counts.get(HARBORFORD.id)).toBe(1)
    expect(counts.get(ALDERMERE.id)).toBe(1)
    expect(counts.get(DOCK_WARD.id)).toBe(1)
    expect(counts.get(YAWNING_PORTAL.id)).toBeUndefined()
    expect(summaries.get(HARBORFORD.id)?.map((item) => item.label)).toEqual(['Dock Ward'])
  })
})

describe('buildLocationDetailViewModel', () => {
  it('includes identity rows, located-in segments, and children', () => {
    const viewModel = buildLocationDetailViewModel(HARBORFORD, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
    })

    expect(viewModel.identity.rows.map((row) => row.label)).toEqual(['Type', 'Classification'])
    expect(viewModel.identity.rows[0]?.value).toBe('Settlement')
    expect(viewModel.identity.rows[1]?.value).toBe('City')
    expect(viewModel.identity.locatedIn.map((segment) => segment.name)).toEqual([
      'Aldermere',
      'Greyshore',
    ])
    expect(viewModel.children.items.map((child) => child.name)).toEqual(['Dock Ward'])
  })

  it('shows building archetype and specialization as separate identity rows', () => {
    const viewModel = buildLocationDetailViewModel(YAWNING_PORTAL, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
    })

    expect(viewModel.identity.rows.map((row) => row.label)).toEqual(['Type', 'Archetype'])
    expect(viewModel.identity.rows[1]?.value).toBe('Tavern')
    expect(viewModel.identity.locatedIn.map((segment) => segment.name)).toEqual([
      'Aldermere',
      'Greyshore',
      'Harborford',
      'Dock Ward',
    ])
  })

  it('omits classification row when unset', () => {
    const viewModel = buildLocationDetailViewModel(DOCK_WARD, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
    })

    expect(viewModel.identity.rows.map((row) => row.label)).toEqual(['Type'])
    expect(viewModel.identity.rows[0]?.value).toBe('District')
  })
})
