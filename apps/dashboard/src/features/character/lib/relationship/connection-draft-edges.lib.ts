import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  characterRelationshipEdgeKindSupportsLifecycle,
  normalizeDraftPersonRelationshipEdge,
  type CharacterRelationshipDraftEdge,
  type CharacterRelationshipDraftEdges,
  type CharacterRelationshipEdgeKind,
} from '@rpg/contracts'

import type { PersonConnectionRoleOption } from './connection-role-catalog'
import type { PlaceConnectionRoleOption } from './connection-role-catalog'
import type { PropertyConnectionRoleOption } from './connection-role-catalog'

export function removeDraftEdgeById(
  edges: CharacterRelationshipDraftEdges,
  edgeId: string,
): CharacterRelationshipDraftEdges {
  return edges.filter((edge) => edge.id !== edgeId)
}

export function upsertDraftEdge(
  edges: CharacterRelationshipDraftEdges,
  edge: CharacterRelationshipDraftEdge,
): CharacterRelationshipDraftEdges {
  const withoutExisting = removeDraftEdgeById(edges, edge.id)
  return [...withoutExisting, edge]
}

export function createPersonDraftEdge(
  role: PersonConnectionRoleOption,
  relatedCharacterId: string,
): CharacterRelationshipDraftEdge {
  const id = crypto.randomUUID()
  const focalEndpoint = CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT

  if (role.kind === 'parentOf' || role.kind === 'mentorOf') {
    const endpoints = normalizeDraftPersonRelationshipEdge({
      kind: role.kind,
      focalEndpoint,
      relatedEndpoint: relatedCharacterId,
      role: role.directedRole!,
    })

    return {
      id,
      kind: role.kind,
      characterId: endpoints.characterId,
      relatedCharacterId: endpoints.relatedCharacterId,
    }
  }

  return {
    id,
    kind: role.kind,
    characterId: focalEndpoint,
    relatedCharacterId,
  } as CharacterRelationshipDraftEdge
}

export function createPlaceDraftEdge(
  role: PlaceConnectionRoleOption,
  locationId: string,
): CharacterRelationshipDraftEdge {
  return {
    id: crypto.randomUUID(),
    kind: role.kind,
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    locationId,
  }
}

export function createPropertyDraftEdge(
  role: PropertyConnectionRoleOption,
  locationId: string,
): CharacterRelationshipDraftEdge {
  return {
    id: crypto.randomUUID(),
    kind: role.kind,
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    locationId,
  }
}

export function createOrganizationMembershipDraftEdge(
  organizationId: string,
  details?: { title?: string; priority?: number },
): CharacterRelationshipDraftEdge {
  return {
    id: crypto.randomUUID(),
    kind: 'organizationMembership',
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    organizationId,
    ...(details?.title !== undefined || details?.priority !== undefined
      ? {
          details: {
            lifecycle: 'current' as const,
            ...(details.title !== undefined ? { title: details.title } : {}),
            ...(details.priority !== undefined ? { priority: details.priority } : {}),
          },
        }
      : {}),
  }
}

export function updateDraftEdgeDetails(
  edge: CharacterRelationshipDraftEdge,
  patch: Record<string, unknown>,
): CharacterRelationshipDraftEdge {
  if (edge.kind === 'organizationMembership') {
    const currentDetails = edge.details ?? { lifecycle: 'current' as const }
    return {
      ...edge,
      details: {
        ...currentDetails,
        ...patch,
      },
    }
  }

  if ('details' in edge) {
    return {
      ...edge,
      details: {
        ...(edge.details ?? {}),
        ...patch,
      },
    } as CharacterRelationshipDraftEdge
  }

  return edge
}

export function draftEdgeTargetId(edge: CharacterRelationshipDraftEdge): string | undefined {
  if ('organizationId' in edge) return edge.organizationId
  if ('locationId' in edge) return edge.locationId
  if ('relatedCharacterId' in edge) return edge.relatedCharacterId
  return undefined
}

export function isPersonRelationshipKind(kind: CharacterRelationshipEdgeKind): boolean {
  return (
    kind === 'parentOf' ||
    kind === 'partnerOf' ||
    kind === 'siblingOf' ||
    kind === 'mentorOf' ||
    kind === 'rivalOf' ||
    kind === 'friendOf' ||
    kind === 'allyOf' ||
    kind === 'enemyOf'
  )
}

export function draftEdgeHasEditableDetails(kind: CharacterRelationshipEdgeKind): boolean {
  if (kind === 'organizationMembership' || kind === 'resides_at') {
    return true
  }

  return characterRelationshipEdgeKindSupportsLifecycle(kind)
}
