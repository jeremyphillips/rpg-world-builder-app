import {
  isSymmetricCharacterRelationshipEdgeKind,
  normalizeDirectedPersonRelationshipEndpoints,
  orderSymmetricCharacterIds,
  type CreateCharacterRelationshipInput,
} from '@rpg/contracts'

import type {
  PersonConnectionRoleOption,
  PlaceConnectionRoleOption,
  PropertyConnectionRoleOption,
} from './connection-role-catalog'

export function buildPersonRelationshipCreateInput(
  focalCharacterId: string,
  relatedCharacterId: string,
  role: PersonConnectionRoleOption,
): CreateCharacterRelationshipInput {
  if (role.kind === 'parentOf' || role.kind === 'mentorOf') {
    const endpoints = normalizeDirectedPersonRelationshipEndpoints({
      kind: role.kind,
      focalCharacterId,
      relatedCharacterId,
      role: role.directedRole!,
    })

    return {
      kind: role.kind,
      characterId: endpoints.characterId,
      relatedCharacterId: endpoints.relatedCharacterId!,
    }
  }

  if (isSymmetricCharacterRelationshipEdgeKind(role.kind)) {
    const [left, right] = orderSymmetricCharacterIds(focalCharacterId, relatedCharacterId)
    return {
      kind: role.kind,
      characterId: left,
      relatedCharacterId: right,
    } as CreateCharacterRelationshipInput
  }

  return {
    kind: role.kind,
    characterId: focalCharacterId,
    relatedCharacterId,
  } as CreateCharacterRelationshipInput
}

export function buildOrganizationMembershipCreateInput(
  focalCharacterId: string,
  organizationId: string,
  details?: { membershipTitleId?: string },
): CreateCharacterRelationshipInput {
  return {
    kind: 'organizationMembership',
    characterId: focalCharacterId,
    organizationId,
    ...(details?.membershipTitleId !== undefined
      ? {
          details: {
            lifecycle: 'current' as const,
            membershipTitleId: details.membershipTitleId,
          },
        }
      : {}),
  }
}

export function buildPlaceRelationshipCreateInput(
  focalCharacterId: string,
  locationId: string,
  role: PlaceConnectionRoleOption,
  details?: Record<string, unknown>,
): CreateCharacterRelationshipInput {
  return {
    kind: role.kind,
    characterId: focalCharacterId,
    locationId,
    ...(details ? { details } : {}),
  } as CreateCharacterRelationshipInput
}

export function buildPropertyRelationshipCreateInput(
  focalCharacterId: string,
  locationId: string,
  role: PropertyConnectionRoleOption,
  details?: Record<string, unknown>,
): CreateCharacterRelationshipInput {
  return {
    kind: role.kind,
    characterId: focalCharacterId,
    locationId,
    ...(details ? { details } : {}),
  } as CreateCharacterRelationshipInput
}
