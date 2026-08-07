import type { Location } from '@rpg/contracts'

export type GeographicPresenceLocationKindFilter = 'all' | 'settlements' | 'regions'

export const GEOGRAPHIC_PRESENCE_LOCATION_KIND_FILTER_LABEL = 'Location type'

export const GEOGRAPHIC_PRESENCE_LOCATION_KIND_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'settlements' as const, label: 'Settlements' },
  { value: 'regions' as const, label: 'Regions' },
] as const satisfies ReadonlyArray<{
  value: GeographicPresenceLocationKindFilter
  label: string
}>

const SETTLEMENT_LOCATION_KINDS = new Set<Location['kind']>(['settlement', 'district'])

export function locationMatchesGeographicPresenceKindFilter(
  location: Location,
  filter: GeographicPresenceLocationKindFilter,
): boolean {
  if (filter === 'all') {
    return true
  }
  if (filter === 'settlements') {
    return SETTLEMENT_LOCATION_KINDS.has(location.kind)
  }
  return location.kind === 'region'
}

export function filterLocationsByGeographicPresenceKindFilter(
  locations: readonly Location[],
  filter: GeographicPresenceLocationKindFilter,
): Location[] {
  if (filter === 'all') {
    return [...locations]
  }
  return locations.filter((location) =>
    locationMatchesGeographicPresenceKindFilter(location, filter),
  )
}
