import type { Location, LocationKind } from '@rpg/contracts'

import type { LocationAuthoringType } from './location-authoring-type'
import {
  resolveRegionRelationshipLabel,
  resolveRegionRelationshipLabelPlural,
} from './location-contextual-terminology.lib'

/** Structure group ids owned by the shared Location → Structure panel. */
export type LocationStructureGroupId = 'districts' | 'regions' | 'subregions' | 'directLocations'

export type LocationStructureGroupProfile = {
  id: LocationStructureGroupId
  /** When set, children matching this kind belong in the structural bucket. */
  childKind?: LocationKind
  expandable: boolean
  /**
   * Nested row levels below the detail surface that may show a disclosure.
   * `2` = two nested levels may expand; deeper rows render counts without a chevron.
   */
  maxInlineDepth: number
}

export type LocationStructureProfile = {
  parentKind: LocationKind
  groups: readonly LocationStructureGroupProfile[]
}

const SETTLEMENT_STRUCTURE_PROFILE: LocationStructureProfile = {
  parentKind: 'settlement',
  groups: [
    {
      id: 'districts',
      childKind: 'district',
      expandable: true,
      maxInlineDepth: 1,
    },
    {
      id: 'directLocations',
      expandable: false,
      maxInlineDepth: 0,
    },
  ],
}

const WORLD_STRUCTURE_PROFILE: LocationStructureProfile = {
  parentKind: 'world',
  groups: [
    {
      id: 'regions',
      childKind: 'region',
      expandable: true,
      maxInlineDepth: 2,
    },
    {
      id: 'directLocations',
      expandable: false,
      maxInlineDepth: 0,
    },
  ],
}

const REGION_STRUCTURE_PROFILE: LocationStructureProfile = {
  parentKind: 'region',
  groups: [
    {
      id: 'subregions',
      childKind: 'region',
      expandable: true,
      maxInlineDepth: 2,
    },
    {
      id: 'directLocations',
      expandable: false,
      maxInlineDepth: 0,
    },
  ],
}

const STRUCTURE_PROFILES_BY_PARENT: Partial<Record<LocationKind, LocationStructureProfile>> = {
  settlement: SETTLEMENT_STRUCTURE_PROFILE,
  world: WORLD_STRUCTURE_PROFILE,
  region: REGION_STRUCTURE_PROFILE,
}

/** Returns the Structure grouping profile for a parent location kind, if any. */
export function resolveLocationStructureProfile(
  parentKind: LocationKind,
): LocationStructureProfile | undefined {
  return STRUCTURE_PROFILES_BY_PARENT[parentKind]
}

export function partitionLocationsByStructureGroup(
  locations: readonly Location[],
  profile: LocationStructureProfile,
): Record<LocationStructureGroupId, Location[]> {
  const buckets = Object.fromEntries(
    profile.groups.map((group) => [group.id, [] as Location[]]),
  ) as Record<LocationStructureGroupId, Location[]>

  const structuralKinds = new Set(
    profile.groups
      .map((group) => group.childKind)
      .filter((kind): kind is LocationKind => kind !== undefined),
  )

  for (const location of locations) {
    const structuralGroup = profile.groups.find((group) => group.childKind === location.kind)
    if (structuralGroup) {
      buckets[structuralGroup.id].push(location)
      continue
    }

    if (!structuralKinds.has(location.kind) && buckets.directLocations) {
      buckets.directLocations.push(location)
    }
  }

  for (const group of profile.groups) {
    buckets[group.id].sort((left, right) => left.name.localeCompare(right.name))
  }

  return buckets
}

/**
 * Projects canonical child-authoring eligibility into Structure UI buckets.
 * Callers pass one `childAuthoringTypesForParentKind` result.
 */
export function resolveStructureChildAuthoringOptions(
  parentKind: LocationKind,
  eligibleTypes: readonly LocationAuthoringType[],
): {
  structural?: LocationAuthoringType
  direct: LocationAuthoringType[]
} {
  const profile = resolveLocationStructureProfile(parentKind)
  const structuralKind = profile?.groups.find((group) => group.childKind)?.childKind

  if (!structuralKind) {
    return { direct: [...eligibleTypes] }
  }

  const structural = eligibleTypes.find((type) => type === structuralKind)
  return {
    structural,
    direct: eligibleTypes.filter((type) => type !== structuralKind),
  }
}

/** Split immediate children into region-kind vs other for Structure count phrases. */
export function partitionImmediateRegionChildCounts(children: readonly Location[]): {
  regionCount: number
  locationCount: number
} {
  let regionCount = 0
  let locationCount = 0

  for (const child of children) {
    if (child.kind === 'region') {
      regionCount += 1
    } else {
      locationCount += 1
    }
  }

  return { regionCount, locationCount }
}

/**
 * Formats immediate-child counts for an expandable Structure row.
 * Region-kind children use the parent-context relationship noun (Region vs Subregion).
 * Non-region children use "location(s)".
 * `2 subregions · 3 locations` means 2 region + 3 non-region immediate children.
 */
export function formatLocationStructureSplitCount(
  children: readonly Location[],
  parentKind: LocationKind,
  formatCount: (count: number, nounSingular: string, nounPlural: string) => string,
): string {
  const { regionCount, locationCount } = partitionImmediateRegionChildCounts(children)
  const parts: string[] = []

  if (regionCount > 0) {
    parts.push(
      formatCount(
        regionCount,
        resolveRegionRelationshipLabel(parentKind).toLowerCase(),
        resolveRegionRelationshipLabelPlural(parentKind).toLowerCase(),
      ),
    )
  }

  if (locationCount > 0) {
    parts.push(formatCount(locationCount, 'location', 'locations'))
  }

  return parts.join(' · ')
}

/** @deprecated Prefer {@link partitionLocationsByStructureGroup} — settlement-only alias. */
export function isSettlementDistrictChild(location: Location): boolean {
  return location.kind === 'district'
}

/** @deprecated Prefer structure profiles — settlement-only alias. */
export function isSettlementDirectPlaceChild(location: Location): boolean {
  return location.kind !== 'district'
}

/** @deprecated Prefer {@link partitionLocationsByStructureGroup}. */
export function partitionSettlementChildLocations(locations: readonly Location[]): {
  districts: Location[]
  directLocations: Location[]
} {
  const { districts, directLocations } = partitionLocationsByStructureGroup(
    locations,
    SETTLEMENT_STRUCTURE_PROFILE,
  )
  return { districts, directLocations }
}

/** @deprecated Prefer {@link resolveStructureChildAuthoringOptions}. */
export function resolveSettlementStructureChildAuthoringOptions(
  eligibleTypes: readonly LocationAuthoringType[],
): {
  district?: 'district'
  direct: LocationAuthoringType[]
} {
  const options = resolveStructureChildAuthoringOptions('settlement', eligibleTypes)
  return {
    district: options.structural === 'district' ? 'district' : undefined,
    direct: options.direct,
  }
}

export function isDistrictAuthoringTypeForSettlement(authoringType: string): boolean {
  return authoringType === 'district'
}

export function isDirectPlaceAuthoringTypeForSettlement(authoringType: string): boolean {
  return authoringType !== 'district'
}
