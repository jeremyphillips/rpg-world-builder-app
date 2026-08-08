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

export function resolveLocationKindBrowseFamily(
  kind: LocationKind,
): LocationKindBrowseFamily | undefined {
  for (const family of LOCATION_KIND_BROWSE_FAMILIES) {
    if ((family.kinds as readonly LocationKind[]).includes(kind)) {
      return family.id
    }
  }

  return undefined
}

export function locationKindMatchesBrowseFamily(
  kind: LocationKind,
  family: LocationKindBrowseFamily,
): boolean {
  return resolveLocationKindBrowseFamily(kind) === family
}
