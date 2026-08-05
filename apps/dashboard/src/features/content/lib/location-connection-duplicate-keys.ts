import type {
  CharacterLocationConnectionKind,
  OrganizationLocationConnectionKind,
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
