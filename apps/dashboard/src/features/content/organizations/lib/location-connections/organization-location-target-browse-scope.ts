import type { Location } from '@rpg/contracts'

export type OrganizationLocationTargetBrowseScope = 'all' | 'settlement' | 'region'

export const ORGANIZATION_LOCATION_TARGET_BROWSE_SCOPE_LABEL = 'Location type'

const BROWSE_SCOPE_LABELS = {
  all: 'All',
  settlement: 'Settlements',
  region: 'Regions',
} as const satisfies Record<OrganizationLocationTargetBrowseScope, string>

/** Settlement-local geography: settlements and districts. */
const SETTLEMENT_SCOPE_LOCATION_KINDS = new Set<Location['kind']>(['settlement', 'district'])

export function locationMatchesTargetBrowseScope(
  location: Location,
  scope: OrganizationLocationTargetBrowseScope,
): boolean {
  if (scope === 'all') {
    return true
  }
  if (scope === 'settlement') {
    return SETTLEMENT_SCOPE_LOCATION_KINDS.has(location.kind)
  }
  return location.kind === 'region'
}

export function filterLocationsByTargetBrowseScope(
  locations: readonly Location[],
  scope: OrganizationLocationTargetBrowseScope,
): Location[] {
  if (scope === 'all') {
    return [...locations]
  }
  return locations.filter((location) => locationMatchesTargetBrowseScope(location, scope))
}

export function countEligibleLocationsForTargetBrowseScope(
  locations: readonly Location[],
  scope: OrganizationLocationTargetBrowseScope,
): number {
  return filterLocationsByTargetBrowseScope(locations, scope).length
}

export type OrganizationLocationTargetBrowseScopeOption = {
  value: OrganizationLocationTargetBrowseScope
  label: string
  disabled?: boolean
}

export function resolveEffectiveTargetBrowseScope(
  selectedScope: OrganizationLocationTargetBrowseScope,
  options: readonly OrganizationLocationTargetBrowseScopeOption[],
  showBrowseScopeControl: boolean,
): OrganizationLocationTargetBrowseScope {
  if (!showBrowseScopeControl) {
    return selectedScope
  }

  const activeScope = options.find((option) => option.value === selectedScope)
  if (activeScope?.disabled && selectedScope !== 'all') {
    return 'all'
  }

  return selectedScope
}

/** Configured scopes stay visible; disable scopes with zero post-eligibility candidates. */
export function resolveTargetBrowseScopeOptions(
  scopes: readonly OrganizationLocationTargetBrowseScope[],
  eligibleLocations: readonly Location[],
): OrganizationLocationTargetBrowseScopeOption[] {
  return scopes.map((scope) => ({
    value: scope,
    label: BROWSE_SCOPE_LABELS[scope],
    disabled:
      scope === 'all'
        ? false
        : countEligibleLocationsForTargetBrowseScope(eligibleLocations, scope) === 0,
  }))
}
