import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import {
  filterLocationsByGeographicPresenceKindFilter,
  locationMatchesGeographicPresenceKindFilter,
} from './organization-geographic-presence-location-kind-filter'

function location(kind: Location['kind'], id = `${kind}-1`): Location {
  return {
    id,
    campaignId: 'camp-1',
    name: id,
    slug: id,
    kind,
  } as Location
}

describe('organization-geographic-presence-location-kind-filter', () => {
  it('matches all location kinds when filter is all', () => {
    expect(locationMatchesGeographicPresenceKindFilter(location('region'), 'all')).toBe(true)
    expect(locationMatchesGeographicPresenceKindFilter(location('settlement'), 'all')).toBe(true)
    expect(locationMatchesGeographicPresenceKindFilter(location('district'), 'all')).toBe(true)
  })

  it('matches settlements and districts for settlements filter', () => {
    expect(locationMatchesGeographicPresenceKindFilter(location('settlement'), 'settlements')).toBe(
      true,
    )
    expect(locationMatchesGeographicPresenceKindFilter(location('district'), 'settlements')).toBe(
      true,
    )
    expect(locationMatchesGeographicPresenceKindFilter(location('region'), 'settlements')).toBe(
      false,
    )
  })

  it('matches only regions for regions filter', () => {
    expect(locationMatchesGeographicPresenceKindFilter(location('region'), 'regions')).toBe(true)
    expect(locationMatchesGeographicPresenceKindFilter(location('settlement'), 'regions')).toBe(
      false,
    )
  })

  it('filters location lists by selected segment', () => {
    const locations = [
      location('region', 'region-1'),
      location('settlement', 'settlement-1'),
      location('district', 'district-1'),
    ]

    expect(filterLocationsByGeographicPresenceKindFilter(locations, 'all')).toHaveLength(3)
    expect(filterLocationsByGeographicPresenceKindFilter(locations, 'settlements')).toEqual([
      locations[1],
      locations[2],
    ])
    expect(filterLocationsByGeographicPresenceKindFilter(locations, 'regions')).toEqual([
      locations[0],
    ])
  })
})
