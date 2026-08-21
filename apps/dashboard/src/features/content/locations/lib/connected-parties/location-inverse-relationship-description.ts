import type {
  CharacterLocationConnectionKind,
  Location,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  resolveLocationReferenceNoun,
} from '@rpg/contracts'

type ContextualInverseRelationshipKind =
  | Extract<OrganizationLocationConnectionKind, 'headquarters' | 'owns' | 'tenant' | 'operator'>
  | Extract<CharacterLocationConnectionKind, 'owns' | 'tenant' | 'operator' | 'works_at'>

const CONTEXTUAL_INVERSE_DESCRIPTION_BY_KIND = {
  headquarters: (noun: string) => `Uses this ${noun} as its primary headquarters.`,
  owns: (noun: string) => `Owns or holds title to this ${noun}.`,
  tenant: (noun: string) => `Occupies or leases this ${noun} without owning it.`,
  operator: (noun: string) => `Runs or manages this ${noun}'s day-to-day operations.`,
  works_at: (noun: string) => `Works at or is regularly present at this ${noun}.`,
} as const satisfies Record<ContextualInverseRelationshipKind, (noun: string) => string>

function isGeographicResidenceLocation(location: Location): boolean {
  return location.kind === 'settlement' || location.kind === 'district'
}

function resolveResidesAtInverseDescription(noun: string, location: Location): string {
  if (isGeographicResidenceLocation(location)) {
    return `Lives in this ${noun}.`
  }

  return `Lives at this ${noun} as a primary residence.`
}

function isContextualInverseRelationshipKind(
  kind: OrganizationLocationConnectionKind | CharacterLocationConnectionKind,
): kind is ContextualInverseRelationshipKind | 'resides_at' {
  return (
    kind === 'resides_at' ||
    Object.prototype.hasOwnProperty.call(CONTEXTUAL_INVERSE_DESCRIPTION_BY_KIND, kind)
  )
}

/** Contextual inverse kind description for endpoint-fixed location drawers. */
export function resolveLocationInverseRelationshipDescription(input: {
  kind: OrganizationLocationConnectionKind | CharacterLocationConnectionKind
  location: Location
}): string {
  const noun = resolveLocationReferenceNoun(input.location)

  if (input.kind === 'resides_at') {
    return resolveResidesAtInverseDescription(noun, input.location)
  }

  if (isContextualInverseRelationshipKind(input.kind)) {
    return CONTEXTUAL_INVERSE_DESCRIPTION_BY_KIND[input.kind](noun)
  }

  return (
    ORGANIZATION_LOCATION_CONNECTION_ENTRIES[input.kind as OrganizationLocationConnectionKind]
      ?.description ??
    CHARACTER_LOCATION_CONNECTION_ENTRIES[input.kind as CharacterLocationConnectionKind].description
  )
}

export function resolveInverseOrganizationKindDescription(
  kind: OrganizationLocationConnectionKind,
  location: Location,
): string {
  if (isContextualInverseRelationshipKind(kind)) {
    return resolveLocationInverseRelationshipDescription({ kind, location })
  }

  return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].description
}

export function resolveInverseCharacterKindDescription(
  kind: CharacterLocationConnectionKind,
  location: Location,
): string {
  return resolveLocationInverseRelationshipDescription({ kind, location })
}
