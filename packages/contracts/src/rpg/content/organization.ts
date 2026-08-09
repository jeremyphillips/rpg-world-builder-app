import { z } from 'zod'

import { organizationKindSchema } from '../vocab/organization-kind'
import {
  organizationSubtypeSchema,
  refineOrganizationKindSubtypePair,
} from '../vocab/organization-subtype'
import { organizationConnectionsSchema } from './organization-connections'
import { createDraftInputSchema } from './lib/content-input-schemas'
import { draftAuthoredContentBodySchema } from './lib/draft-authored-content'
import { contentBodyBaseSchema, contentMetaSchema, slugSchema } from './lib/envelope'
import { ORGANIZATION_CONTENT_TYPE_TERM } from './lib/content-type-terms'

/** Publish-complete organization body fields (object — refinements applied below). */
const organizationBodyFieldsSchema = contentBodyBaseSchema.extend({
  organizationKind: organizationKindSchema,
  organizationSubtype: organizationSubtypeSchema.optional(),
  connections: organizationConnectionsSchema.default({ locations: [] }),
})

/** Publish-complete organization body. */
export const organizationBodySchema = organizationBodyFieldsSchema.superRefine(
  refineOrganizationKindSubtypePair,
)

export type OrganizationBody = z.infer<typeof organizationBodySchema>

/** Draft organization body fields — kind/subtype may remain unset until publish. */
const organizationBodyDraftFieldsSchema = draftAuthoredContentBodySchema(
  ORGANIZATION_CONTENT_TYPE_TERM.label,
).extend({
  organizationKind: organizationKindSchema.optional(),
  organizationSubtype: organizationSubtypeSchema.optional(),
})

/** Draft organization body — kind may remain unset until publish. */
export const organizationBodyDraftSchema = organizationBodyDraftFieldsSchema.superRefine(
  refineOrganizationKindSubtypePair,
)

export type OrganizationBodyDraft = z.infer<typeof organizationBodyDraftSchema>

/** Stored published organization = ownership envelope + complete body. */
export const organizationSchema = contentMetaSchema
  .extend(organizationBodyFieldsSchema.shape)
  .superRefine(refineOrganizationKindSubtypePair)

export type Organization = z.infer<typeof organizationSchema>

/** Stored draft organization = ownership envelope + relaxed body. */
export const organizationDraftStoredSchema = contentMetaSchema
  .extend(organizationBodyDraftFieldsSchema.shape)
  .superRefine(refineOrganizationKindSubtypePair)

export type OrganizationDraft = z.infer<typeof organizationDraftStoredSchema>

/** Saved-reference read result; null preserves an explicitly missing/deleted reference. */
export const organizationReferenceResolutionSchema = z.object({
  organizationId: z.string().min(1),
  /** Descriptive membership title when present on the character connection. */
  title: z.string().trim().min(1).max(80).optional(),
  organization: z.union([organizationSchema, organizationDraftStoredSchema]).nullable(),
})

export type OrganizationReferenceResolution = z.infer<typeof organizationReferenceResolutionSchema>

export const createOrganizationInputSchema = organizationBodyFieldsSchema
  .extend({ slug: slugSchema })
  .superRefine(refineOrganizationKindSubtypePair)

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>

export const createOrganizationDraftInputSchema = createDraftInputSchema(
  organizationBodyDraftFieldsSchema,
).superRefine(refineOrganizationKindSubtypePair)

export type CreateOrganizationDraftInput = z.infer<typeof createOrganizationDraftInputSchema>

/**
 * Partial publish update. Pair check fires only when both fields are present in the
 * patch; merged-document validity is enforced at the API write layer.
 * `organizationSubtype: null` clears a stored subtype (`$unset`).
 */
export const updateOrganizationInputSchema = organizationBodyFieldsSchema
  .extend({
    slug: slugSchema,
    organizationSubtype: organizationSubtypeSchema.nullable().optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    // Pair check only when both fields are in the patch; merged validity is API-enforced.
    if (typeof data.organizationKind !== 'string' || typeof data.organizationSubtype !== 'string') {
      return
    }
    refineOrganizationKindSubtypePair(
      {
        organizationKind: data.organizationKind,
        organizationSubtype: data.organizationSubtype,
      },
      ctx,
    )
  })

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>

export const updateOrganizationDraftInputSchema = createDraftInputSchema(
  organizationBodyDraftFieldsSchema,
)
  .extend({
    organizationSubtype: organizationSubtypeSchema.nullable().optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    if (typeof data.organizationKind !== 'string' || typeof data.organizationSubtype !== 'string') {
      return
    }
    refineOrganizationKindSubtypePair(
      {
        organizationKind: data.organizationKind,
        organizationSubtype: data.organizationSubtype,
      },
      ctx,
    )
  })

export type UpdateOrganizationDraftInput = z.infer<typeof updateOrganizationDraftInputSchema>
