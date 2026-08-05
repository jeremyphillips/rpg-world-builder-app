import { z } from 'zod'

import {
  getTerritorialAuthorityPriority,
  territorialAuthorityKindSchema,
  type TerritorialAuthorityKind,
} from '../../vocab/location/territorial-authority'

// ---------------------------------------------------------------------------
// Territorial authority — region-owned edges to organizations only.
// Sovereignty family; distinct from partyAssociations (presence).
// ---------------------------------------------------------------------------

export const territorialAuthorityRelationshipSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  kind: territorialAuthorityKindSchema,
})

export type TerritorialAuthorityRelationship = z.infer<
  typeof territorialAuthorityRelationshipSchema
>

export const territorialAuthorityRelationshipsSchema = z
  .array(territorialAuthorityRelationshipSchema)
  .default([])
  .superRefine((relationships, ctx) => {
    const seenIds = new Set<string>()

    relationships.forEach((relationship, index) => {
      if (seenIds.has(relationship.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Territorial authority ids must be unique within the region.',
          path: [index, 'id'],
        })
      }
      seenIds.add(relationship.id)
    })
  })

export type TerritorialAuthorityRelationships = z.infer<
  typeof territorialAuthorityRelationshipsSchema
>

/** Builds a persisted territorial authority row from authoring input. */
export function buildTerritorialAuthorityRelationship(input: {
  id: string
  organizationId: string
  kind: TerritorialAuthorityKind
}): TerritorialAuthorityRelationship {
  return {
    id: input.id,
    organizationId: input.organizationId,
    kind: input.kind,
  }
}

/** Sorts territorial rows by in-family priority, then stable id tie-breaker. */
export function sortTerritorialAuthorityRelationships(
  relationships: readonly TerritorialAuthorityRelationship[],
): TerritorialAuthorityRelationship[] {
  return [...relationships].sort((left, right) => {
    const priorityCompare =
      getTerritorialAuthorityPriority(right.kind) - getTerritorialAuthorityPriority(left.kind)
    if (priorityCompare !== 0) return priorityCompare
    return left.id.localeCompare(right.id)
  })
}

/** Groups territorial rows by kind label order (priority descending). */
export function groupTerritorialAuthorityRelationshipsByKind(
  relationships: readonly TerritorialAuthorityRelationship[],
): Map<TerritorialAuthorityKind, TerritorialAuthorityRelationship[]> {
  const sorted = sortTerritorialAuthorityRelationships(relationships)
  const grouped = new Map<TerritorialAuthorityKind, TerritorialAuthorityRelationship[]>()

  for (const relationship of sorted) {
    const bucket = grouped.get(relationship.kind) ?? []
    bucket.push(relationship)
    grouped.set(relationship.kind, bucket)
  }

  return grouped
}
