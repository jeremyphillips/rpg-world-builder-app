import { z } from 'zod'

import { organizationLocationConnectionKindSchema } from '../vocab/location/organization-location-connection'
import { contentStatusSchema } from './lib/envelope'
import { createLocationInputSchema, locationSchema } from './location'
import { createOrganizationInputSchema, organizationSchema } from './organization'
import { organizationLocationConnectionSchema } from './organization-location-connection'

const draftIdSchema = z.string().trim().min(1).max(120)

export const buildingCreateRelationshipTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('existing'), organizationId: z.string().trim().min(1) }),
  z.object({ kind: z.literal('new'), organizationDraftId: draftIdSchema }),
])

export const buildingCreateCompositionRequestSchema = z
  .object({
    building: z.object({
      status: contentStatusSchema.default('published'),
      input: createLocationInputSchema,
    }),
    organizations: z
      .array(
        z.object({
          organizationDraftId: draftIdSchema,
          status: contentStatusSchema.default('published'),
          input: createOrganizationInputSchema,
        }),
      )
      .default([]),
    relationships: z
      .array(
        z.object({
          relationshipDraftId: draftIdSchema,
          kind: organizationLocationConnectionKindSchema,
          organization: buildingCreateRelationshipTargetSchema,
        }),
      )
      .default([]),
  })
  .superRefine((value, ctx) => {
    const organizationDraftIds = new Set<string>()
    value.organizations.forEach((organization, index) => {
      if (organizationDraftIds.has(organization.organizationDraftId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Organization draft ids must be unique.',
          path: ['organizations', index, 'organizationDraftId'],
        })
      }
      organizationDraftIds.add(organization.organizationDraftId)
    })

    const relationshipDraftIds = new Set<string>()
    value.relationships.forEach((relationship, index) => {
      if (relationshipDraftIds.has(relationship.relationshipDraftId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Relationship draft ids must be unique.',
          path: ['relationships', index, 'relationshipDraftId'],
        })
      }
      relationshipDraftIds.add(relationship.relationshipDraftId)

      if (
        relationship.organization.kind === 'new' &&
        !organizationDraftIds.has(relationship.organization.organizationDraftId)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Relationship references an unknown organization draft.',
          path: ['relationships', index, 'organization', 'organizationDraftId'],
        })
      }
    })
  })

export type BuildingCreateCompositionRequest = z.infer<
  typeof buildingCreateCompositionRequestSchema
>

export const buildingCreateCompositionIssueSchema = z.object({
  target: z.enum(['building', 'organization', 'relationship', 'capability']),
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().optional(),
  organizationDraftId: draftIdSchema.optional(),
  relationshipDraftId: draftIdSchema.optional(),
})

export type BuildingCreateCompositionIssue = z.infer<typeof buildingCreateCompositionIssueSchema>

export const buildingCreateCompositionErrorDetailsSchema = z.object({
  issues: z.array(buildingCreateCompositionIssueSchema).min(1),
})

export const buildingCreateCompositionResponseSchema = z.object({
  building: locationSchema,
  organizations: z.array(
    z.object({
      organizationDraftId: draftIdSchema,
      organization: organizationSchema,
    }),
  ),
  relationships: z.array(
    z.object({
      relationshipDraftId: draftIdSchema,
      organizationId: z.string().min(1),
      connection: organizationLocationConnectionSchema,
    }),
  ),
})

export type BuildingCreateCompositionResponse = z.infer<
  typeof buildingCreateCompositionResponseSchema
>

const BUILDING_INPUT_ISSUE_PATH_PREFIX = 'building.input.'

/** Maps request-scoped Zod paths onto location form field paths for issue attribution. */
export function normalizeBuildingCreateCompositionIssuePath(
  path: string | undefined,
): string | undefined {
  if (!path) return path
  if (path.startsWith(BUILDING_INPUT_ISSUE_PATH_PREFIX)) {
    return path.slice(BUILDING_INPUT_ISSUE_PATH_PREFIX.length)
  }
  return path
}
