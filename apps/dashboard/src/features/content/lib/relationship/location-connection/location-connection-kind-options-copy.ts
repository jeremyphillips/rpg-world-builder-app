import type {
  CharacterLocationConnectionKind,
  Location,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

/** Location-owned copy and description resolvers supplied into kind-option builders. */
export type LocationConnectionKindOptionsCopy = {
  duplicateClaimReason: string
  resolveInverseOrganizationKindDescription: (
    kind: OrganizationLocationConnectionKind,
    location: Location,
  ) => string
  resolveInverseCharacterKindDescription: (
    kind: CharacterLocationConnectionKind,
    location: Location,
  ) => string
  resolveTerritorialKindOccupiedReason: (input: {
    kind: Extract<OrganizationLocationConnectionKind, 'governs' | 'controls'>
    occupantName: string
  }) => string
}
