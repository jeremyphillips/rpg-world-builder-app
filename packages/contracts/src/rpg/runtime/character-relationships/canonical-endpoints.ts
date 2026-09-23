import {
  type CharacterRelationshipEdgeKind,
  isSymmetricCharacterRelationshipEdgeKind,
} from '../../vocab/character-relationship/kind'

export type CharacterRelationshipEndpoints = {
  characterId: string
  organizationId?: string
  locationId?: string
  relatedCharacterId?: string
}

export type DirectedPersonRelationshipRole = 'parent' | 'child' | 'mentor' | 'student'

/** Stable ordering for symmetric character-to-character edges. */
export function orderSymmetricCharacterIds(
  leftCharacterId: string,
  rightCharacterId: string,
): readonly [string, string] {
  return leftCharacterId.localeCompare(rightCharacterId) <= 0
    ? [leftCharacterId, rightCharacterId]
    : [rightCharacterId, leftCharacterId]
}

/**
 * Normalizes directed person edges so the canonical stored direction matches the kind
 * definition: parentOf stores parent → child; mentorOf stores mentor → student.
 */
export function normalizeDirectedPersonRelationshipEndpoints(input: {
  kind: 'parentOf' | 'mentorOf'
  focalCharacterId: string
  relatedCharacterId: string
  role: DirectedPersonRelationshipRole
}): CharacterRelationshipEndpoints {
  if (input.kind === 'parentOf') {
    if (input.role === 'parent') {
      return { characterId: input.focalCharacterId, relatedCharacterId: input.relatedCharacterId }
    }
    return { characterId: input.relatedCharacterId, relatedCharacterId: input.focalCharacterId }
  }

  if (input.role === 'mentor') {
    return { characterId: input.focalCharacterId, relatedCharacterId: input.relatedCharacterId }
  }
  return { characterId: input.relatedCharacterId, relatedCharacterId: input.focalCharacterId }
}

/** Canonicalizes endpoints for persistence and uniqueness checks. */
export function canonicalizeCharacterRelationshipEndpoints(input: {
  kind: CharacterRelationshipEdgeKind
  characterId: string
  organizationId?: string
  locationId?: string
  relatedCharacterId?: string
}): CharacterRelationshipEndpoints {
  if (input.kind === 'organizationMembership') {
    return { characterId: input.characterId, organizationId: input.organizationId }
  }

  if (
    input.kind === 'resides_at' ||
    input.kind === 'owns' ||
    input.kind === 'tenant' ||
    input.kind === 'operator' ||
    input.kind === 'works_at' ||
    input.kind === 'hometown' ||
    input.kind === 'birthplace'
  ) {
    return { characterId: input.characterId, locationId: input.locationId }
  }

  if (isSymmetricCharacterRelationshipEdgeKind(input.kind)) {
    const [left, right] = orderSymmetricCharacterIds(input.characterId, input.relatedCharacterId!)
    return { characterId: left, relatedCharacterId: right }
  }

  return { characterId: input.characterId, relatedCharacterId: input.relatedCharacterId }
}

/** Builds the canonical uniqueness key for campaign + kind + endpoints. */
export function buildCharacterRelationshipCanonicalKey(input: {
  kind: CharacterRelationshipEdgeKind
  characterId: string
  organizationId?: string
  locationId?: string
  relatedCharacterId?: string
}): string {
  const endpoints = canonicalizeCharacterRelationshipEndpoints(input)

  if (endpoints.organizationId) {
    return `${endpoints.characterId}:${endpoints.organizationId}`
  }
  if (endpoints.locationId) {
    return `${endpoints.characterId}:${endpoints.locationId}`
  }
  if (endpoints.relatedCharacterId) {
    return `${endpoints.characterId}:${endpoints.relatedCharacterId}`
  }

  return endpoints.characterId
}

/** Returns whether the viewer occupies the stored source endpoint for a directed edge. */
export function isViewerRelationshipSource(
  viewerCharacterId: string,
  endpoints: CharacterRelationshipEndpoints,
): boolean {
  return endpoints.characterId === viewerCharacterId
}
