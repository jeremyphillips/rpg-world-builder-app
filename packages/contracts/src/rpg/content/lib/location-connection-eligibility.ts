import type { LocationKind } from '../../vocab/location/kind'
import type { StructureType } from '../../vocab/location/structure-type'
import {
  CHARACTER_LOCATION_CONNECTION_KIND_IDS,
  type CharacterLocationConnectionKind,
} from '../../vocab/location/character-location-connection'
import {
  ORGANIZATION_LOCATION_CONNECTION_KIND_IDS,
  type OrganizationLocationConnectionKind,
} from '../../vocab/location/organization-location-connection'
import { STRUCTURE_TYPE_IDS } from '../../vocab/location/structure-type'

/** Canonical location shape for connection eligibility — discriminated body fields only. */
export type LocationConnectionEligibilityInput = {
  kind: LocationKind
  structureType?: StructureType
}

export type LocationConnectionEligibility = {
  characterKinds: readonly CharacterLocationConnectionKind[]
  organizationKinds: readonly OrganizationLocationConnectionKind[]
}

type LocationConnectionProfile =
  | 'plane'
  | 'world'
  | 'region'
  | 'settlement'
  | 'district'
  | 'site'
  | 'building'
  | 'fortification'
  | 'infrastructure'
  | 'monument'
  | 'vessel'
  | 'structure'
  | 'interior'

const NO_CHARACTER_KINDS = [] as const satisfies readonly CharacterLocationConnectionKind[]
const NO_ORGANIZATION_KINDS = [] as const satisfies readonly OrganizationLocationConnectionKind[]

const CHARACTER_KINDS = {
  owns: 'owns',
  tenant: 'tenant',
  resides_at: 'resides_at',
  operator: 'operator',
  works_at: 'works_at',
} as const satisfies Record<string, CharacterLocationConnectionKind>

const ORGANIZATION_KINDS = {
  owns: 'owns',
  tenant: 'tenant',
  operator: 'operator',
  headquarters: 'headquarters',
  operates_in: 'operates_in',
  governs: 'governs',
  controls: 'controls',
  claims: 'claims',
} as const satisfies Record<string, OrganizationLocationConnectionKind>

const LOCATION_CONNECTION_ELIGIBILITY_BY_PROFILE = {
  plane: { characterKinds: NO_CHARACTER_KINDS, organizationKinds: NO_ORGANIZATION_KINDS },
  world: { characterKinds: NO_CHARACTER_KINDS, organizationKinds: NO_ORGANIZATION_KINDS },
  region: {
    characterKinds: NO_CHARACTER_KINDS,
    organizationKinds: [
      ORGANIZATION_KINDS.operates_in,
      ORGANIZATION_KINDS.governs,
      ORGANIZATION_KINDS.controls,
      ORGANIZATION_KINDS.claims,
    ],
  },
  settlement: {
    characterKinds: [CHARACTER_KINDS.resides_at],
    organizationKinds: [
      ORGANIZATION_KINDS.headquarters,
      ORGANIZATION_KINDS.operates_in,
      ORGANIZATION_KINDS.governs,
    ],
  },
  district: {
    characterKinds: [CHARACTER_KINDS.resides_at],
    organizationKinds: [ORGANIZATION_KINDS.operates_in],
  },
  site: { characterKinds: NO_CHARACTER_KINDS, organizationKinds: NO_ORGANIZATION_KINDS },
  building: {
    characterKinds: [
      CHARACTER_KINDS.owns,
      CHARACTER_KINDS.tenant,
      CHARACTER_KINDS.resides_at,
      CHARACTER_KINDS.operator,
      CHARACTER_KINDS.works_at,
    ],
    organizationKinds: [
      ORGANIZATION_KINDS.owns,
      ORGANIZATION_KINDS.tenant,
      ORGANIZATION_KINDS.headquarters,
      ORGANIZATION_KINDS.operator,
    ],
  },
  fortification: {
    characterKinds: [
      CHARACTER_KINDS.owns,
      CHARACTER_KINDS.resides_at,
      CHARACTER_KINDS.operator,
      CHARACTER_KINDS.works_at,
    ],
    organizationKinds: [
      ORGANIZATION_KINDS.owns,
      ORGANIZATION_KINDS.headquarters,
      ORGANIZATION_KINDS.operator,
    ],
  },
  infrastructure: {
    characterKinds: [CHARACTER_KINDS.owns, CHARACTER_KINDS.operator, CHARACTER_KINDS.works_at],
    organizationKinds: [ORGANIZATION_KINDS.owns, ORGANIZATION_KINDS.operator],
  },
  monument: { characterKinds: NO_CHARACTER_KINDS, organizationKinds: NO_ORGANIZATION_KINDS },
  vessel: {
    characterKinds: [
      CHARACTER_KINDS.owns,
      CHARACTER_KINDS.resides_at,
      CHARACTER_KINDS.operator,
      CHARACTER_KINDS.works_at,
    ],
    organizationKinds: [ORGANIZATION_KINDS.owns, ORGANIZATION_KINDS.operator],
  },
  structure: {
    characterKinds: [
      CHARACTER_KINDS.owns,
      CHARACTER_KINDS.tenant,
      CHARACTER_KINDS.resides_at,
      CHARACTER_KINDS.operator,
      CHARACTER_KINDS.works_at,
    ],
    organizationKinds: [
      ORGANIZATION_KINDS.owns,
      ORGANIZATION_KINDS.tenant,
      ORGANIZATION_KINDS.headquarters,
      ORGANIZATION_KINDS.operator,
    ],
  },
  interior: {
    characterKinds: [CHARACTER_KINDS.tenant, CHARACTER_KINDS.resides_at, CHARACTER_KINDS.works_at],
    organizationKinds: [ORGANIZATION_KINDS.tenant, ORGANIZATION_KINDS.headquarters],
  },
} as const satisfies Record<LocationConnectionProfile, LocationConnectionEligibility>

/** Resolves the eligibility profile from canonical persisted location fields. */
export function resolveLocationConnectionProfile(
  location: LocationConnectionEligibilityInput,
): LocationConnectionProfile {
  if (location.kind === 'structure') {
    if (
      location.structureType &&
      (STRUCTURE_TYPE_IDS as readonly string[]).includes(location.structureType)
    ) {
      return location.structureType as Exclude<
        LocationConnectionProfile,
        'plane' | 'world' | 'region' | 'settlement' | 'district' | 'site' | 'structure' | 'interior'
      >
    }
    return 'structure'
  }

  return location.kind
}

/** Canonical SSOT for which connection kinds each location profile accepts. */
export function resolveLocationConnectionEligibility(
  location: LocationConnectionEligibilityInput,
): LocationConnectionEligibility {
  const profile = resolveLocationConnectionProfile(location)
  return LOCATION_CONNECTION_ELIGIBILITY_BY_PROFILE[profile]
}

export function isCharacterLocationConnectionEligible(
  location: LocationConnectionEligibilityInput,
  kind: CharacterLocationConnectionKind,
): boolean {
  return resolveLocationConnectionEligibility(location).characterKinds.includes(kind)
}

export function isOrganizationLocationConnectionEligible(
  location: LocationConnectionEligibilityInput,
  kind: OrganizationLocationConnectionKind,
): boolean {
  return resolveLocationConnectionEligibility(location).organizationKinds.includes(kind)
}

/** Ensures every declared connection kind appears in at least one eligibility profile. */
export function assertLocationConnectionEligibilityExhaustive(): void {
  const characterKinds = new Set<CharacterLocationConnectionKind>()
  const organizationKinds = new Set<OrganizationLocationConnectionKind>()

  for (const eligibility of Object.values(LOCATION_CONNECTION_ELIGIBILITY_BY_PROFILE)) {
    for (const kind of eligibility.characterKinds) {
      characterKinds.add(kind)
    }
    for (const kind of eligibility.organizationKinds) {
      organizationKinds.add(kind)
    }
  }

  for (const kind of CHARACTER_LOCATION_CONNECTION_KIND_IDS) {
    if (!characterKinds.has(kind)) {
      throw new Error(`Character location connection kind "${kind}" is missing from eligibility.`)
    }
  }

  for (const kind of ORGANIZATION_LOCATION_CONNECTION_KIND_IDS) {
    if (!organizationKinds.has(kind)) {
      throw new Error(
        `Organization location connection kind "${kind}" is missing from eligibility.`,
      )
    }
  }
}

assertLocationConnectionEligibilityExhaustive()
