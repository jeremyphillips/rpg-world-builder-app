import type { CharacterRelationshipEdgeKind } from '@rpg/contracts'

export const CONNECTION_TOP_LEVEL_SECTION_IDS = [
  'people',
  'organizations',
  'places',
  'property',
] as const

export type ConnectionTopLevelSectionId = (typeof CONNECTION_TOP_LEVEL_SECTION_IDS)[number]

export type ConnectionSectionDefinition = {
  id: ConnectionTopLevelSectionId
  heading: string
  description: string
  singularAddLabel: string
}

export const CONNECTION_SECTION_CATALOG: Record<
  ConnectionTopLevelSectionId,
  ConnectionSectionDefinition
> = {
  people: {
    id: 'people',
    heading: 'People',
    description: 'Family, friends, allies, rivals, and other characters.',
    singularAddLabel: 'person',
  },
  organizations: {
    id: 'organizations',
    heading: 'Organizations',
    description: 'Memberships, affiliations, and loyalties.',
    singularAddLabel: 'organization',
  },
  places: {
    id: 'places',
    heading: 'Places',
    description: 'Home, residence, birthplace, and other meaningful locations.',
    singularAddLabel: 'place',
  },
  property: {
    id: 'property',
    heading: 'Property',
    description: 'Buildings and other property you own, manage, or are associated with.',
    singularAddLabel: 'property',
  },
}

const PEOPLE_KINDS = new Set<CharacterRelationshipEdgeKind>([
  'parentOf',
  'partnerOf',
  'siblingOf',
  'mentorOf',
  'rivalOf',
  'friendOf',
  'allyOf',
  'enemyOf',
])

const PLACE_KINDS = new Set<CharacterRelationshipEdgeKind>(['hometown', 'birthplace', 'resides_at'])

const PROPERTY_KINDS = new Set<CharacterRelationshipEdgeKind>([
  'owns',
  'tenant',
  'operator',
  'works_at',
])

export function getConnectionTopLevelSectionForKind(
  kind: CharacterRelationshipEdgeKind,
): ConnectionTopLevelSectionId {
  if (kind === 'organizationMembership') return 'organizations'
  if (PEOPLE_KINDS.has(kind)) return 'people'
  if (PLACE_KINDS.has(kind)) return 'places'
  if (PROPERTY_KINDS.has(kind)) return 'property'
  return 'people'
}

export function filterDraftEdgesBySection<T extends { kind: CharacterRelationshipEdgeKind }>(
  edges: readonly T[],
  sectionId: ConnectionTopLevelSectionId,
): T[] {
  return edges.filter((edge) => getConnectionTopLevelSectionForKind(edge.kind) === sectionId)
}

export function filterProjectionsBySection<T extends { kind: CharacterRelationshipEdgeKind }>(
  rows: readonly T[],
  sectionId: ConnectionTopLevelSectionId,
): T[] {
  return rows.filter((row) => getConnectionTopLevelSectionForKind(row.kind) === sectionId)
}
