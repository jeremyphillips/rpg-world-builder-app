import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import { ALDERMERE, DOCK_WARD, LOCATIONS_LIST, HARBORFORD, YAWNING_PORTAL } from '../fixtures'
import {
  buildChildCountByParentId,
  buildChildSummariesByParentId,
  buildLocationChildren,
  buildLocationDetailViewModel,
  buildLocationEntitySummarySearchText,
  buildLocationEntitySummaryVm,
  buildLocationLocatedInSegments,
  buildLocationsById,
  LOCATION_UNKNOWN_ANCESTOR_LABEL,
} from './location-display'
import { LOCATION_UNCONTAINED_LABEL } from './location-parent-replacement-surface-copy'

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

describe('buildLocationEntitySummaryVm', () => {
  it('projects classification and ancestry items with convenience text', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    const summary = buildLocationEntitySummaryVm(YAWNING_PORTAL, {
      locationsById: byId,
      campaignId: CAMPAIGN_ID,
    })

    expect(summary.name).toBe('Yawning Portal')
    expect(summary.classification.text).toBe('Building · Tavern')
    expect(summary.ancestry.items.map((item) => item.name)).toEqual([
      'Aldermere',
      'Greyshore',
      'Harborford',
      'Dock Ward',
    ])
    expect(summary.ancestry.text).toBe('Aldermere / Greyshore / Harborford / Dock Ward')
  })

  it('omits ancestry convenience text when there are no ancestor items', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    const summary = buildLocationEntitySummaryVm(ALDERMERE, {
      locationsById: byId,
      campaignId: CAMPAIGN_ID,
    })

    expect(summary.ancestry.items).toEqual([])
    expect(summary.ancestry.text).toBe('')
  })

  it('builds search haystack from name, classification parts, and ancestor names', () => {
    const byId = buildLocationsById(LOCATIONS_LIST)
    const summary = buildLocationEntitySummaryVm(YAWNING_PORTAL, {
      locationsById: byId,
      campaignId: CAMPAIGN_ID,
    })

    expect(buildLocationEntitySummarySearchText(summary)).toBe(
      'Yawning Portal Building Tavern Aldermere Greyshore Harborford Dock Ward',
    )
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

  it('derives uncontained copy and parent replacement action for managers', () => {
    const rootViewModel = buildLocationDetailViewModel(ALDERMERE, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    })
    const nestedViewModel = buildLocationDetailViewModel(YAWNING_PORTAL, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    })

    expect(rootViewModel.identity.locatedInFallbackLabel).toBe(LOCATION_UNCONTAINED_LABEL)
    expect(rootViewModel.identity.parentReplacementAction).toBe('setParent')
    expect(nestedViewModel.identity.locatedInFallbackLabel).toBeUndefined()
    expect(nestedViewModel.identity.parentReplacementAction).toBe('changeParent')
  })
})
