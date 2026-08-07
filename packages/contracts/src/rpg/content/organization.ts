import { z } from 'zod'

import { organizationKindSchema } from '../vocab/organization-kind'
import { organizationConnectionsSchema } from './organization-connections'
import { createDraftInputSchema, createPublishInputSchema } from './lib/content-input-schemas'
import { draftAuthoredContentBodySchema } from './lib/draft-authored-content'
import { contentBodyBaseSchema, contentMetaSchema } from './lib/envelope'
import { ORGANIZATION_CONTENT_TYPE_TERM } from './lib/content-type-terms'

/** Publish-complete organization body. */
export const organizationBodySchema = contentBodyBaseSchema.extend({
  organizationKind: organizationKindSchema,
  connections: organizationConnectionsSchema.default({ locations: [] }),
})

export type OrganizationBody = z.infer<typeof organizationBodySchema>

/** Draft organization body — kind may remain unset until publish. */
export const organizationBodyDraftSchema = draftAuthoredContentBodySchema(
  ORGANIZATION_CONTENT_TYPE_TERM.label,
).extend({
  organizationKind: organizationKindSchema.optional(),
})

export type OrganizationBodyDraft = z.infer<typeof organizationBodyDraftSchema>

/** Stored published organization = ownership envelope + complete body. */
export const organizationSchema = contentMetaSchema.extend(organizationBodySchema.shape)

export type Organization = z.infer<typeof organizationSchema>

/** Stored draft organization = ownership envelope + relaxed body. */
export const organizationDraftStoredSchema = contentMetaSchema.extend(
  organizationBodyDraftSchema.shape,
)

export type OrganizationDraft = z.infer<typeof organizationDraftStoredSchema>

/** Saved-reference read result; null preserves an explicitly missing/deleted reference. */
export const organizationReferenceResolutionSchema = z.object({
  organizationId: z.string().min(1),
  organization: z.union([organizationSchema, organizationDraftStoredSchema]).nullable(),
})

export type OrganizationReferenceResolution = z.infer<typeof organizationReferenceResolutionSchema>

export const createOrganizationInputSchema = createPublishInputSchema(organizationBodySchema)

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>

export const createOrganizationDraftInputSchema = createDraftInputSchema(
  organizationBodyDraftSchema,
)

export type CreateOrganizationDraftInput = z.infer<typeof createOrganizationDraftInputSchema>

export const updateOrganizationInputSchema = createOrganizationInputSchema.partial()

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>

export const updateOrganizationDraftInputSchema = createOrganizationDraftInputSchema.partial()

export type UpdateOrganizationDraftInput = z.infer<typeof updateOrganizationDraftInputSchema>
