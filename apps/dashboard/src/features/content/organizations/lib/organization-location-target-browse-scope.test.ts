import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import {
  filterLocationsByTargetBrowseScope,
  locationMatchesTargetBrowseScope,
  resolveTargetBrowseScopeOptions,
} from './organization-location-target-browse-scope'

function location(kind: Location['kind'], id = `${kind}-1`): Location {
  return {
    id,
    campaignId: 'camp-1',
    name: id,
    slug: id,
    kind,
  } as Location
}

describe('organization-location-target-browse-scope', () => {
  it('matches all location kinds when scope is all', () => {
    expect(locationMatchesTargetBrowseScope(location('region'), 'all')).toBe(true)
    expect(locationMatchesTargetBrowseScope(location('settlement'), 'all')).toBe(true)
    expect(locationMatchesTargetBrowseScope(location('district'), 'all')).toBe(true)
  })

  it('matches settlements and districts for settlement scope', () => {
    expect(locationMatchesTargetBrowseScope(location('settlement'), 'settlement')).toBe(true)
    expect(locationMatchesTargetBrowseScope(location('district'), 'settlement')).toBe(true)
    expect(locationMatchesTargetBrowseScope(location('region'), 'settlement')).toBe(false)
  })

  it('matches only regions for region scope', () => {
    expect(locationMatchesTargetBrowseScope(location('region'), 'region')).toBe(true)
    expect(locationMatchesTargetBrowseScope(location('settlement'), 'region')).toBe(false)
    expect(locationMatchesTargetBrowseScope(location('district'), 'region')).toBe(false)
  })

  it('filters location lists by selected scope', () => {
    const locations = [
      location('region', 'region-1'),
      location('settlement', 'settlement-1'),
      location('district', 'district-1'),
    ]

    expect(filterLocationsByTargetBrowseScope(locations, 'all')).toHaveLength(3)
    expect(filterLocationsByTargetBrowseScope(locations, 'settlement')).toEqual([
      locations[1],
      locations[2],
    ])
    expect(filterLocationsByTargetBrowseScope(locations, 'region')).toEqual([locations[0]])
  })

  it('keeps configured scopes visible and disables empty scopes', () => {
    const regionOnly = [location('region', 'region-1')]

    expect(resolveTargetBrowseScopeOptions(['all', 'settlement', 'region'], regionOnly)).toEqual([
      { value: 'all', label: 'All', disabled: false },
      { value: 'settlement', label: 'Settlements', disabled: true },
      { value: 'region', label: 'Regions', disabled: false },
    ])
  })

  it('never disables the all scope', () => {
    expect(resolveTargetBrowseScopeOptions(['all', 'settlement', 'region'], [])).toEqual([
      { value: 'all', label: 'All', disabled: false },
      { value: 'settlement', label: 'Settlements', disabled: true },
      { value: 'region', label: 'Regions', disabled: true },
    ])
  })
})
