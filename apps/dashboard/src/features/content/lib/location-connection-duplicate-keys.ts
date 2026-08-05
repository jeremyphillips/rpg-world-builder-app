import type {
  CharacterLocationConnectionKind,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  organizationLocationConnectionHasAvailableKindInFamily,
  organizationLocationConnectionKindBlockedForLocation,
} from '@rpg/contracts'

export function organizationLocationConnectionKey(
  locationId: string,
  kind: OrganizationLocationConnectionKind,
): string {
  return `${locationId}:${kind}`
}

export function characterLocationConnectionKey(
  locationId: string,
  kind: CharacterLocationConnectionKind,
): string {
  return `${locationId}:${kind}`
}

export function subjectLocationConnectionKey(subjectId: string, kind: string): string {
  return `${subjectId}:${kind}`
}

export function buildOrganizationLocationConnectionKeySet(
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  excludeConnectionId?: string,
): Set<string> {
  const keys = new Set<string>()
  for (const connection of connections) {
    if (excludeConnectionId && connection.id === excludeConnectionId) {
      continue
    }
    keys.add(organizationLocationConnectionKey(connection.locationId, connection.kind))
  }
  return keys
}

export function buildSubjectLocationConnectionKeySet(
  rows: ReadonlyArray<{ subject: { id: string }; kind: string; relationshipId?: string }>,
  excludeRelationshipId?: string,
): Set<string> {
  const keys = new Set<string>()
  for (const row of rows) {
    if (excludeRelationshipId && row.relationshipId === excludeRelationshipId) {
      continue
    }
    keys.add(subjectLocationConnectionKey(row.subject.id, row.kind))
  }
  return keys
}

type OrganizationLocationConnectionLike = {
  id?: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export function isOrganizationLocationConnectionKindBlockedForLocation(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  connections: readonly OrganizationLocationConnectionLike[]
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): boolean {
  return organizationLocationConnectionKindBlockedForLocation(input)
}

export function organizationLocationConnectionHasAvailableKind(input: {
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  subjectOrganizationId: string
  connections: readonly OrganizationLocationConnectionLike[]
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): boolean {
  return organizationLocationConnectionHasAvailableKindInFamily(input)
}

export function buildOrganizationLocationConnectionEdgesAtLocation(
  rows: ReadonlyArray<{
    subject: { id: string; type: string }
    kind: string
    relationshipId: string
  }>,
  locationId: string,
): OrganizationLocationConnectionEdgeAtLocation[] {
  return rows
    .filter((row) => row.subject.type === 'organization')
    .map((row) => ({
      organizationId: row.subject.id,
      connectionId: row.relationshipId,
      locationId,
      kind: row.kind as OrganizationLocationConnectionKind,
      subjectName: undefined,
    }))
}

export function buildOrganizationInverseLocationConnections(
  rows: ReadonlyArray<{
    subject: { id: string }
    kind: string
    relationshipId?: string
  }>,
  locationId: string,
  organizationId: string,
  excludeRelationshipId?: string,
): OrganizationLocationConnectionLike[] {
  return rows
    .filter((row) => row.subject.id === organizationId)
    .map((row) => ({
      id: row.relationshipId,
      locationId,
      kind: row.kind as OrganizationLocationConnectionKind,
    }))
    .filter((connection) => !excludeRelationshipId || connection.id !== excludeRelationshipId)
}
