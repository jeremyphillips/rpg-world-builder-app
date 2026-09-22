import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  type CharacterLocationReferenceResolution,
  type CharacterRelationshipDraftEdge,
  type CharacterRelationshipDraftEdges,
  type CharacterRelationshipProjectionRow,
  type MembershipRelationshipDetails,
  type OrganizationReferenceResolution,
} from '@rpg/contracts'
import { z } from 'zod'

import { createLocalRelationshipId } from './relationship-edge-api-sync.lib'

export const organizationMembershipFormRowSchema = z.object({
  relationshipId: z.string().min(1),
  revision: z.number().int().positive().optional(),
  organizationId: z.string().min(1),
  title: z.string().optional(),
  priority: z.number().int().optional(),
})

export type OrganizationMembershipFormRow = z.infer<typeof organizationMembershipFormRowSchema>

export const residenceFormRowSchema = z.object({
  relationshipId: z.string().min(1),
  revision: z.number().int().positive().optional(),
  locationId: z.string().min(1),
  kind: z.literal('resides_at'),
})

export type ResidenceFormRow = z.infer<typeof residenceFormRowSchema>

export type OrganizationMembershipSheetRow = OrganizationReferenceResolution & {
  relationshipId: string
  revision: number
}

export function createDraftOrganizationMembershipRow(
  organizationId: string,
): OrganizationMembershipFormRow {
  return {
    relationshipId: crypto.randomUUID(),
    organizationId,
  }
}

export function createDraftResidenceRow(locationId: string): ResidenceFormRow {
  return {
    relationshipId: crypto.randomUUID(),
    locationId,
    kind: 'resides_at',
  }
}

export function createApiOrganizationMembershipRow(
  organizationId: string,
): OrganizationMembershipFormRow & { revision: number } {
  return {
    relationshipId: createLocalRelationshipId(),
    revision: 0,
    organizationId,
  }
}

export function createApiResidenceRow(locationId: string): ResidenceFormRow & { revision: number } {
  return {
    relationshipId: createLocalRelationshipId(),
    revision: 0,
    locationId,
    kind: 'resides_at',
  }
}

function membershipDetailsFromRow(
  row: OrganizationMembershipFormRow,
): MembershipRelationshipDetails | undefined {
  if (row.title === undefined && row.priority === undefined) {
    return undefined
  }

  return {
    lifecycle: 'current',
    ...(row.title !== undefined ? { title: row.title } : {}),
    ...(row.priority !== undefined ? { priority: row.priority } : {}),
  }
}

export function organizationMembershipRowToDraftEdge(
  row: OrganizationMembershipFormRow,
): Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }> {
  const details = membershipDetailsFromRow(row)

  return {
    id: row.relationshipId,
    kind: 'organizationMembership',
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    organizationId: row.organizationId,
    ...(details ? { details } : {}),
  }
}

export function residenceRowToDraftEdge(
  row: ResidenceFormRow,
): Extract<CharacterRelationshipDraftEdge, { kind: 'resides_at' }> {
  return {
    id: row.relationshipId,
    kind: 'resides_at',
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    locationId: row.locationId,
  }
}

export function draftEdgeToOrganizationMembershipRow(
  edge: Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }>,
): OrganizationMembershipFormRow {
  return {
    relationshipId: edge.id,
    organizationId: edge.organizationId,
    ...(edge.details?.title !== undefined ? { title: edge.details.title } : {}),
    ...(edge.details?.priority !== undefined ? { priority: edge.details.priority } : {}),
  }
}

export function draftEdgeToResidenceRow(
  edge: Extract<CharacterRelationshipDraftEdge, { kind: 'resides_at' }>,
): ResidenceFormRow {
  return {
    relationshipId: edge.id,
    locationId: edge.locationId,
    kind: 'resides_at',
  }
}

export function relationshipEdgesToOrganizationMembershipRows(
  edges: CharacterRelationshipDraftEdges,
): OrganizationMembershipFormRow[] {
  return edges
    .filter(
      (edge): edge is Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }> =>
        edge.kind === 'organizationMembership',
    )
    .map(draftEdgeToOrganizationMembershipRow)
}

export function relationshipEdgesToResidenceRows(
  edges: CharacterRelationshipDraftEdges,
): ResidenceFormRow[] {
  return edges
    .filter(
      (edge): edge is Extract<CharacterRelationshipDraftEdge, { kind: 'resides_at' }> =>
        edge.kind === 'resides_at',
    )
    .map(draftEdgeToResidenceRow)
}

export function relationshipEdgesFromMembershipAndResidenceRows(input: {
  organizations: readonly OrganizationMembershipFormRow[]
  locations: readonly ResidenceFormRow[]
  priorEdges: CharacterRelationshipDraftEdges
}): CharacterRelationshipDraftEdges {
  const preservedEdges = input.priorEdges.filter(
    (edge) => edge.kind !== 'organizationMembership' && edge.kind !== 'resides_at',
  )

  return [
    ...preservedEdges,
    ...input.organizations.map(organizationMembershipRowToDraftEdge),
    ...input.locations.map(residenceRowToDraftEdge),
  ]
}

export function areRelationshipDraftEdgesEqual(
  left: CharacterRelationshipDraftEdges,
  right: CharacterRelationshipDraftEdges,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function membershipDetailsFromProjection(
  row: CharacterRelationshipProjectionRow,
): MembershipRelationshipDetails {
  return (row.details ?? {}) as MembershipRelationshipDetails
}

export function organizationMembershipProjectionToFormRow(
  row: CharacterRelationshipProjectionRow,
): OrganizationMembershipFormRow {
  const details = membershipDetailsFromProjection(row)

  return {
    relationshipId: row.relationshipId,
    revision: row.revision,
    organizationId: row.target?.type === 'organization' ? row.target.id : '',
    ...(details.title !== undefined ? { title: details.title } : {}),
    ...(details.priority !== undefined ? { priority: details.priority } : {}),
  }
}

export function residenceProjectionToFormRow(
  row: CharacterRelationshipProjectionRow,
): ResidenceFormRow {
  return {
    relationshipId: row.relationshipId,
    revision: row.revision,
    locationId: row.target?.type === 'location' ? row.target.id : '',
    kind: 'resides_at',
  }
}

export function organizationMembershipProjectionToSheetRow(
  row: CharacterRelationshipProjectionRow,
): OrganizationMembershipSheetRow {
  const details = membershipDetailsFromProjection(row)
  const organizationId = row.target?.type === 'organization' ? row.target.id : ''

  return {
    relationshipId: row.relationshipId,
    revision: row.revision,
    organizationId,
    ...(details.title !== undefined ? { title: details.title } : {}),
    ...(details.priority !== undefined ? { priority: details.priority } : {}),
    organization: null,
  }
}

export function residenceProjectionToReferenceResolution(
  row: CharacterRelationshipProjectionRow,
): CharacterLocationReferenceResolution {
  const locationId = row.target?.type === 'location' ? row.target.id : ''

  return {
    connection: {
      id: row.relationshipId,
      locationId,
      kind: 'resides_at',
    },
    location:
      row.target?.type === 'location'
        ? ({
            id: row.target.id,
            name: row.target.name,
            slug: row.target.slug,
          } as CharacterLocationReferenceResolution['location'])
        : null,
  }
}

export function organizationMembershipProjectionsToFormValues(
  rows: readonly CharacterRelationshipProjectionRow[],
): { organizations: OrganizationMembershipFormRow[] } {
  return {
    organizations: rows
      .filter((row) => row.kind === 'organizationMembership')
      .map(organizationMembershipProjectionToFormRow),
  }
}

export function residenceProjectionsToFormValues(
  rows: readonly CharacterRelationshipProjectionRow[],
): { locations: ResidenceFormRow[] } {
  return {
    locations: rows.filter((row) => row.kind === 'resides_at').map(residenceProjectionToFormRow),
  }
}

export function areOrganizationMembershipProjectionsEqual(
  left: readonly CharacterRelationshipProjectionRow[],
  right: readonly CharacterRelationshipProjectionRow[],
): boolean {
  return (
    JSON.stringify(organizationMembershipProjectionsToFormValues(left).organizations) ===
    JSON.stringify(organizationMembershipProjectionsToFormValues(right).organizations)
  )
}

export function areResidenceProjectionsEqual(
  left: readonly CharacterRelationshipProjectionRow[],
  right: readonly CharacterRelationshipProjectionRow[],
): boolean {
  return (
    JSON.stringify(residenceProjectionsToFormValues(left).locations) ===
    JSON.stringify(residenceProjectionsToFormValues(right).locations)
  )
}

export function organizationMembershipFormRowContentEqual(
  left: OrganizationMembershipFormRow,
  right: OrganizationMembershipFormRow,
): boolean {
  return (
    left.organizationId === right.organizationId &&
    left.title === right.title &&
    left.priority === right.priority
  )
}

export function residenceFormRowContentEqual(
  left: ResidenceFormRow,
  right: ResidenceFormRow,
): boolean {
  return left.locationId === right.locationId && left.kind === right.kind
}
