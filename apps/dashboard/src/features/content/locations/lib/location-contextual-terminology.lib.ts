import type { LocationKind } from '@rpg/contracts'

/** Derived relationship role when a Region is parented by another Region. */
export const LOCATION_SUBREGION_LABEL = 'Subregion' as const
export const LOCATION_SUBREGION_LABEL_PLURAL = 'Subregions' as const

export const LOCATION_REGION_LABEL = 'Region' as const
export const LOCATION_REGION_LABEL_PLURAL = 'Regions' as const

/**
 * Whether Region authoring/relationship copy should use the Subregion role.
 * Canonical persisted kind remains `region`.
 */
export function isRegionSubregionContext(parentKind: LocationKind | undefined): boolean {
  return parentKind === 'region'
}

/** Singular relationship label for a region-kind child under the given parent. */
export function resolveRegionRelationshipLabel(parentKind: LocationKind | undefined): string {
  return isRegionSubregionContext(parentKind) ? LOCATION_SUBREGION_LABEL : LOCATION_REGION_LABEL
}

/** Plural group / count noun for region-kind children under the given parent. */
export function resolveRegionRelationshipLabelPlural(parentKind: LocationKind | undefined): string {
  return isRegionSubregionContext(parentKind)
    ? LOCATION_SUBREGION_LABEL_PLURAL
    : LOCATION_REGION_LABEL_PLURAL
}
