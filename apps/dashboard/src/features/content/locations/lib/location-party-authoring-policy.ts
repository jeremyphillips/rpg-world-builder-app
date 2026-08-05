import type { LocationPartyAssociation, LocationPartyAssociationSemanticId } from '@rpg/contracts'

import { LOCATION_AUTHORING_TYPE_IDS, type LocationAuthoringType } from './location-authoring-type'
import { getLocationRelationshipCapabilities } from './location-relationship-capabilities'

/**
 * Conservative v1 dashboard authoring policy — not domain truth.
 *
 * Controls which existing relationship semantics are exposed in authoring UI
 * for each location authoring type. Contracts/API remain permissive for all kinds.
 */
export const LOCATION_PARTY_AUTHORING_POLICY = {
  plane: getLocationRelationshipCapabilities('plane').partyAssociationSemanticKeys,
  world: getLocationRelationshipCapabilities('world').partyAssociationSemanticKeys,
  region: getLocationRelationshipCapabilities('region').partyAssociationSemanticKeys,
  settlement: getLocationRelationshipCapabilities('settlement').partyAssociationSemanticKeys,
  district: getLocationRelationshipCapabilities('district').partyAssociationSemanticKeys,
  site: getLocationRelationshipCapabilities('site').partyAssociationSemanticKeys,
  building: getLocationRelationshipCapabilities('building').partyAssociationSemanticKeys,
  fortification: getLocationRelationshipCapabilities('fortification').partyAssociationSemanticKeys,
  infrastructure:
    getLocationRelationshipCapabilities('infrastructure').partyAssociationSemanticKeys,
  monument: getLocationRelationshipCapabilities('monument').partyAssociationSemanticKeys,
  vessel: getLocationRelationshipCapabilities('vessel').partyAssociationSemanticKeys,
  structure: getLocationRelationshipCapabilities('structure').partyAssociationSemanticKeys,
  interior: getLocationRelationshipCapabilities('interior').partyAssociationSemanticKeys,
} as const satisfies Record<LocationAuthoringType, readonly LocationPartyAssociationSemanticId[]>

/** Relationship semantic keys currently available for authoring on this location type. */
export function getAvailableLocationPartyAssociationKinds(
  authoringType: LocationAuthoringType,
): readonly LocationPartyAssociationSemanticId[] {
  return LOCATION_PARTY_AUTHORING_POLICY[authoringType]
}

/** True when at least one relationship role is currently available for authoring. */
export function isLocationPartyAssociationAuthoringSupported(
  authoringType: LocationAuthoringType,
): boolean {
  return getAvailableLocationPartyAssociationKinds(authoringType).length > 0
}

/** True when party associations should appear in detail or edit surfaces. */
export function shouldShowLocationPartyAssociationsSection(input: {
  authoringType: LocationAuthoringType
  associations: readonly LocationPartyAssociation[]
}): boolean {
  return (
    input.associations.length > 0 ||
    isLocationPartyAssociationAuthoringSupported(input.authoringType)
  )
}

/** Ensures policy keys stay aligned with the dashboard LocationAuthoringType SSOT. */
export function assertLocationPartyAuthoringPolicyExhaustive(): void {
  const policyKeys = Object.keys(LOCATION_PARTY_AUTHORING_POLICY).sort()
  const authoringTypeIds = [...LOCATION_AUTHORING_TYPE_IDS].sort()

  if (policyKeys.length !== authoringTypeIds.length) {
    throw new Error('Location party authoring policy is missing authoring type keys.')
  }

  for (let index = 0; index < policyKeys.length; index += 1) {
    if (policyKeys[index] !== authoringTypeIds[index]) {
      throw new Error(
        `Location party authoring policy key mismatch: expected ${authoringTypeIds[index]}, got ${policyKeys[index]}.`,
      )
    }
  }
}

assertLocationPartyAuthoringPolicyExhaustive()
