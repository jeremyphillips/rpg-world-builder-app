import { z } from 'zod'

import { organizationDomainSchema } from '../vocab/organization-domain'
import { organizationFunctionSchema } from '../vocab/organization-function'
import { organizationFormSchema } from '../vocab/organization-form'
import { organizationPracticeSchema } from '../vocab/organization-practice'
import { organizationConnectionsSchema } from './organization-connections'
import {
  organizationCreateMembershipTitlesInputRefinement,
  organizationMembershipTitlesSchema,
  organizationSourcePresetIdSchema,
  type OrganizationMembershipTitleDefinition,
} from './organization-membership-titles'
import { createDraftInputSchema } from './lib/content-input-schemas'
import { draftAuthoredContentBodySchema } from './lib/draft-authored-content'
import { contentBodyBaseSchema, contentMetaSchema, slugSchema } from './lib/envelope'
import { ORGANIZATION_CONTENT_TYPE_TERM } from './lib/content-type-terms'

function uniqueOrganizationClassificationArray<T extends z.ZodTypeAny>(
  itemSchema: T,
  label: string,
) {
  return z.array(itemSchema).refine((values) => new Set(values).size === values.length, {
    message: `Organization ${label} must not contain duplicates.`,
  })
}

const organizationFunctionsSchema = uniqueOrganizationClassificationArray(
  organizationFunctionSchema,
  'functions',
)
const organizationPracticesSchema = uniqueOrganizationClassificationArray(
  organizationPracticeSchema,
  'practices',
)
const organizationMembersClassAffinityIdsSchema = uniqueOrganizationClassificationArray(
  z.string().min(1),
  'member class affinity ids',
)
const organizationMembersSpeciesAffinityIdsSchema = uniqueOrganizationClassificationArray(
  z.string().min(1),
  'member species affinity ids',
)

const defaultOrganizationMembersAffinity = {
  classAffinityIds: [] as string[],
  speciesAffinityIds: [] as string[],
}

const defaultOrganizationMembers = {
  classAffinityIds: [] as string[],
  speciesAffinityIds: [] as string[],
  titles: [] as OrganizationMembershipTitleDefinition[],
}

const organizationMembersAffinityFieldsSchema = z.object({
  classAffinityIds: organizationMembersClassAffinityIdsSchema.default([]),
  speciesAffinityIds: organizationMembersSpeciesAffinityIdsSchema.default([]),
})

export const organizationMembersSchema = organizationMembersAffinityFieldsSchema.extend({
  titles: organizationMembershipTitlesSchema,
})

export type OrganizationMembers = z.infer<typeof organizationMembersSchema>

const organizationMembersWithOptionalTitlesSchema = organizationMembersAffinityFieldsSchema.extend({
  titles: organizationMembershipTitlesSchema.optional(),
})

/** Classification + identity fields mutable on normal organization edit. */
const organizationClassificationBodyFieldsSchema = contentBodyBaseSchema.extend({
  organizationDomain: organizationDomainSchema,
  organizationForm: organizationFormSchema.optional(),
  functions: organizationFunctionsSchema.default([]),
  practices: organizationPracticesSchema.default([]),
  members: organizationMembersAffinityFieldsSchema.default(defaultOrganizationMembersAffinity),
  connections: organizationConnectionsSchema.default({ locations: [] }),
})

const organizationClassificationFieldsWithoutAuthoredBodySchema =
  organizationClassificationBodyFieldsSchema.omit({
    name: true,
    description: true,
    imageKey: true,
  })

/** Draft classification fields — domain may remain unset until publish. */
const organizationClassificationDraftFieldsSchema =
  organizationClassificationFieldsWithoutAuthoredBodySchema.extend({
    organizationDomain: organizationDomainSchema.optional(),
  })

/** Publish-complete organization body fields. */
const organizationBodyFieldsSchema = organizationClassificationBodyFieldsSchema
  .omit({ members: true })
  .extend({
    members: organizationMembersSchema.default(defaultOrganizationMembers),
    sourcePresetId: organizationSourcePresetIdSchema,
  })

/** Publish-complete organization body. */
export const organizationBodySchema = organizationBodyFieldsSchema

export type OrganizationBody = z.infer<typeof organizationBodySchema>

/** Draft organization body fields — domain may remain unset until publish. */
const organizationBodyDraftFieldsSchema = draftAuthoredContentBodySchema(
  ORGANIZATION_CONTENT_TYPE_TERM.label,
)
  .extend(organizationClassificationDraftFieldsSchema.shape)
  .omit({ members: true })
  .extend({
    members: organizationMembersSchema.default(defaultOrganizationMembers),
    sourcePresetId: organizationSourcePresetIdSchema,
  })

/** Draft organization body — domain may remain unset until publish. */
export const organizationBodyDraftSchema = organizationBodyDraftFieldsSchema

export type OrganizationBodyDraft = z.infer<typeof organizationBodyDraftSchema>

/** Stored published organization = ownership envelope + complete body. */
export const organizationSchema = contentMetaSchema.extend(organizationBodyFieldsSchema.shape)

export type Organization = z.infer<typeof organizationSchema>

/** Stored draft organization = ownership envelope + relaxed body. */
export const organizationDraftStoredSchema = contentMetaSchema.extend(
  organizationBodyDraftFieldsSchema.shape,
)

export type OrganizationDraft = z.infer<typeof organizationDraftStoredSchema>

/** Saved-reference read result; null preserves an explicitly missing/deleted reference. */
export const organizationReferenceResolutionSchema = z.object({
  organizationId: z.string().min(1),
  /** Descriptive membership title when present on the character connection. */
  title: z.string().trim().min(1).max(80).optional(),
  /** Presentation/order precedence when present on the character connection. */
  priority: z.number().int().optional(),
  organization: z.union([organizationSchema, organizationDraftStoredSchema]).nullable(),
})

export type OrganizationReferenceResolution = z.infer<typeof organizationReferenceResolutionSchema>

export const createOrganizationInputSchema = organizationClassificationBodyFieldsSchema
  .omit({ members: true })
  .extend({
    slug: slugSchema,
    sourcePresetId: organizationSourcePresetIdSchema,
    members: organizationMembersWithOptionalTitlesSchema.default(
      defaultOrganizationMembersAffinity,
    ),
  })
  .superRefine(organizationCreateMembershipTitlesInputRefinement)

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>

export const createOrganizationDraftInputSchema = createDraftInputSchema(
  organizationBodyDraftFieldsSchema,
).superRefine(organizationCreateMembershipTitlesInputRefinement)

export type CreateOrganizationDraftInput = z.infer<typeof createOrganizationDraftInputSchema>

/**
 * Partial publish update. `organizationForm: null` clears the optional stored form (`$unset`).
 */
export const updateOrganizationInputSchema = organizationClassificationBodyFieldsSchema
  .extend({
    slug: slugSchema,
    organizationForm: organizationFormSchema.nullable().optional(),
    functions: organizationFunctionsSchema.optional(),
    practices: organizationPracticesSchema.optional(),
    members: organizationMembersAffinityFieldsSchema.partial().optional(),
  })
  .partial()

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>

export const updateOrganizationDraftInputSchema = organizationBodyDraftFieldsSchema
  .extend({
    organizationForm: organizationFormSchema.nullable().optional(),
    functions: organizationFunctionsSchema.optional(),
    practices: organizationPracticesSchema.optional(),
    members: organizationMembersAffinityFieldsSchema.partial().optional(),
  })
  .partial()

export type UpdateOrganizationDraftInput = z.infer<typeof updateOrganizationDraftInputSchema>
