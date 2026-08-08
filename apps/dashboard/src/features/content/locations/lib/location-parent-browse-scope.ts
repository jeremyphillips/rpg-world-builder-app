import type { Location } from '@rpg/contracts'

import {
  LOCATION_KIND_BROWSE_FAMILIES,
  locationKindMatchesBrowseFamily,
  resolveLocationKindBrowseFamily,
  type LocationKindBrowseFamily,
} from './location-kind-browse-families'

export type LocationParentBrowseScope = 'all' | LocationKindBrowseFamily

export const LOCATION_PARENT_BROWSE_SCOPE_LABEL = 'Parent location type' as const

const ALL_BROWSE_SCOPE_OPTION = {
  value: 'all' as const,
  label: 'All',
}

export type LocationParentBrowseScopeOption = {
  value: LocationParentBrowseScope
  label: string
}

export function locationMatchesParentBrowseScope(
  location: Location,
  scope: LocationParentBrowseScope,
): boolean {
  if (scope === 'all') {
    return true
  }

  return locationKindMatchesBrowseFamily(location.kind, scope)
}

export function filterLocationsByParentBrowseScope(
  locations: readonly Location[],
  scope: LocationParentBrowseScope,
): Location[] {
  if (scope === 'all') {
    return [...locations]
  }

  return locations.filter((location) => locationMatchesParentBrowseScope(location, scope))
}

/** Derive browse segments from families present in the eligible candidate set only. */
export function resolveParentBrowseScopeOptions(
  eligibleCandidates: readonly Location[],
): LocationParentBrowseScopeOption[] {
  const familiesPresent = new Set<LocationKindBrowseFamily>()

  for (const candidate of eligibleCandidates) {
    const family = resolveLocationKindBrowseFamily(candidate.kind)
    if (family) {
      familiesPresent.add(family)
    }
  }

  const options: LocationParentBrowseScopeOption[] = [ALL_BROWSE_SCOPE_OPTION]

  for (const family of LOCATION_KIND_BROWSE_FAMILIES) {
    if (familiesPresent.has(family.id)) {
      options.push({ value: family.id, label: family.label })
    }
  }

  return options
}

export function shouldShowParentBrowseScopes(
  options: readonly LocationParentBrowseScopeOption[],
): boolean {
  return options.filter((option) => option.value !== 'all').length >= 2
}
