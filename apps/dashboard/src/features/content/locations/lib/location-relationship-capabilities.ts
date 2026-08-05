import {
  TERRITORIAL_AUTHORITY_KIND_IDS,
  type LocationPartyAssociationSemanticId,
  type TerritorialAuthorityKind,
} from '@rpg/contracts'

import { LOCATION_AUTHORING_TYPE_IDS, type LocationAuthoringType } from './location-authoring-type'

/** Dashboard SSOT — which relationship families each location type may author. */
export const LOCATION_RELATIONSHIP_CAPABILITIES = {
  plane: {
    partyAssociationSemanticKeys: [],
    territorialAuthorityKinds: [],
  },
  world: {
    partyAssociationSemanticKeys: [],
    territorialAuthorityKinds: [],
  },
  region: {
    partyAssociationSemanticKeys: ['headquarters', 'operator'],
    territorialAuthorityKinds: [...TERRITORIAL_AUTHORITY_KIND_IDS],
  },
  settlement: {
    partyAssociationSemanticKeys: ['resident', 'headquarters'],
    territorialAuthorityKinds: [],
  },
  district: {
    partyAssociationSemanticKeys: ['resident', 'headquarters'],
    territorialAuthorityKinds: [],
  },
  site: {
    partyAssociationSemanticKeys: [],
    territorialAuthorityKinds: [],
  },
  building: {
    partyAssociationSemanticKeys: [
      'owner',
      'tenant',
      'resident',
      'headquarters',
      'operator',
      'works_at',
    ],
    territorialAuthorityKinds: [],
  },
  fortification: {
    partyAssociationSemanticKeys: ['owner', 'resident', 'headquarters', 'operator', 'works_at'],
    territorialAuthorityKinds: [],
  },
  infrastructure: {
    partyAssociationSemanticKeys: ['owner', 'operator', 'works_at'],
    territorialAuthorityKinds: [],
  },
  monument: {
    partyAssociationSemanticKeys: [],
    territorialAuthorityKinds: [],
  },
  vessel: {
    partyAssociationSemanticKeys: ['owner', 'resident', 'operator', 'works_at'],
    territorialAuthorityKinds: [],
  },
  structure: {
    partyAssociationSemanticKeys: [
      'owner',
      'tenant',
      'resident',
      'headquarters',
      'operator',
      'works_at',
    ],
    territorialAuthorityKinds: [],
  },
  interior: {
    partyAssociationSemanticKeys: ['tenant', 'resident', 'headquarters', 'works_at'],
    territorialAuthorityKinds: [],
  },
} as const satisfies Record<
  LocationAuthoringType,
  {
    partyAssociationSemanticKeys: readonly LocationPartyAssociationSemanticId[]
    territorialAuthorityKinds: readonly TerritorialAuthorityKind[]
  }
>

export function getLocationRelationshipCapabilities(authoringType: LocationAuthoringType) {
  return LOCATION_RELATIONSHIP_CAPABILITIES[authoringType]
}

/** Ensures capability keys stay aligned with the dashboard LocationAuthoringType SSOT. */
export function assertLocationRelationshipCapabilitiesExhaustive(): void {
  const capabilityKeys = Object.keys(LOCATION_RELATIONSHIP_CAPABILITIES).sort()
  const authoringTypeIds = [...LOCATION_AUTHORING_TYPE_IDS].sort()

  if (capabilityKeys.length !== authoringTypeIds.length) {
    throw new Error('Location relationship capabilities are missing authoring type keys.')
  }

  for (let index = 0; index < capabilityKeys.length; index += 1) {
    if (capabilityKeys[index] !== authoringTypeIds[index]) {
      throw new Error(
        `Location relationship capability key mismatch: expected ${authoringTypeIds[index]}, got ${capabilityKeys[index]}.`,
      )
    }
  }
}

assertLocationRelationshipCapabilitiesExhaustive()
