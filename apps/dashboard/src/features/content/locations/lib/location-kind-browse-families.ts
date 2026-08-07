import type { LocationKind } from '@rpg/contracts'

export type LocationKindBrowseFamily =
  | 'world_and_regions'
  | 'settlements'
  | 'sites'
  | 'structures'
  | 'interiors'

export const LOCATION_KIND_BROWSE_FAMILY_LABELS = {
  world_and_regions: 'World & regions',
  settlements: 'Settlements',
  sites: 'Sites',
  structures: 'Structures',
  interiors: 'Interiors',
} as const satisfies Record<LocationKindBrowseFamily, string>

const WORLD_AND_REGIONS_KINDS = new Set<LocationKind>(['plane', 'world', 'region'])
const SETTLEMENT_KINDS = new Set<LocationKind>(['settlement', 'district'])
const SITE_KINDS = new Set<LocationKind>(['site'])
const STRUCTURE_KINDS = new Set<LocationKind>(['structure'])
const INTERIOR_KINDS = new Set<LocationKind>(['interior'])

export function resolveLocationKindBrowseFamily(
  kind: LocationKind,
): LocationKindBrowseFamily | undefined {
  if (WORLD_AND_REGIONS_KINDS.has(kind)) {
    return 'world_and_regions'
  }
  if (SETTLEMENT_KINDS.has(kind)) {
    return 'settlements'
  }
  if (SITE_KINDS.has(kind)) {
    return 'sites'
  }
  if (STRUCTURE_KINDS.has(kind)) {
    return 'structures'
  }
  if (INTERIOR_KINDS.has(kind)) {
    return 'interiors'
  }
  return undefined
}

export const LOCATION_KIND_BROWSE_FAMILIES = [
  {
    id: 'world_and_regions' as const,
    label: LOCATION_KIND_BROWSE_FAMILY_LABELS.world_and_regions,
    kinds: ['plane', 'world', 'region'] as const satisfies readonly LocationKind[],
  },
  {
    id: 'settlements' as const,
    label: LOCATION_KIND_BROWSE_FAMILY_LABELS.settlements,
    kinds: ['settlement', 'district'] as const satisfies readonly LocationKind[],
  },
  {
    id: 'sites' as const,
    label: LOCATION_KIND_BROWSE_FAMILY_LABELS.sites,
    kinds: ['site'] as const satisfies readonly LocationKind[],
  },
  {
    id: 'structures' as const,
    label: LOCATION_KIND_BROWSE_FAMILY_LABELS.structures,
    kinds: ['structure'] as const satisfies readonly LocationKind[],
  },
  {
    id: 'interiors' as const,
    label: LOCATION_KIND_BROWSE_FAMILY_LABELS.interiors,
    kinds: ['interior'] as const satisfies readonly LocationKind[],
  },
] as const

export function locationKindMatchesBrowseFamily(
  kind: LocationKind,
  family: LocationKindBrowseFamily,
): boolean {
  return resolveLocationKindBrowseFamily(kind) === family
}
