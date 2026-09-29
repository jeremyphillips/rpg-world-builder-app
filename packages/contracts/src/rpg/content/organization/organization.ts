import { z } from 'zod'

import { organizationDomainSchema } from '../../vocab/organization/domain'
import { organizationFunctionSchema } from '../../vocab/organization/function'
import { organizationFormSchema } from '../../vocab/organization/form'
import { organizationPracticeSchema } from '../../vocab/organization/practice'
import { organizationConnectionsSchema } from './connections'
import {
  createDefaultOrganizationMembershipTitleDefinition,
  organizationCreateMembershipTitlesInputRefinement,
  organizationMembershipTitlesSchema,
  type OrganizationMembershipTitleDefinition,
} from './membership-titles'
import { createDraftInputSchema } from '../lib/content-input-schemas'
import { contentMetaSchema, slugSchema } from '../lib/envelope'
import { ORGANIZATION_CONTENT_TYPE_TERM } from '../lib/content-type-terms'
import {
  mediaBearingAuthoredContentBodySchema,
  mediaBearingDraftAuthoredContentBodySchema,
} from '../lib/media/media-bearing-content'

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
  titles: [
    createDefaultOrganizationMembershipTitleDefinition(() => 'schema-default'),
  ] as OrganizationMembershipTitleDefinition[],
}

const organizationMembersAffinityFieldsSchema = z.object({
  classAffinityIds: organizationMembersClassAffinityIdsSchema.default([]),
  speciesAffinityIds: organizationMembersSpeciesAffinityIdsSchema.default([]),
})

export const organizationMemberAffinitiesUpdateSchema = z.object({
  classAffinityIds: organizationMembersClassAffinityIdsSchema.optional(),
  speciesAffinityIds: organizationMembersSpeciesAffinityIdsSchema.optional(),
})

/** Organization update — affinities and/or a full membership title catalog replacement. */
export const organizationMembersUpdateSchema = organizationMemberAffinitiesUpdateSchema.extend({
  titles: organizationMembershipTitlesSchema.optional(),
})

export type OrganizationMemberAffinitiesUpdate = z.infer<
  typeof organizationMemberAffinitiesUpdateSchema
>

export type OrganizationMembersUpdate = z.infer<typeof organizationMembersUpdateSchema>

export const organizationMembersSchema = organizationMembersAffinityFieldsSchema.extend({
  titles: organizationMembershipTitlesSchema,
})

export type OrganizationMembers = z.infer<typeof organizationMembersSchema>

const organizationMembersWithOptionalTitlesSchema = organizationMembersAffinityFieldsSchema.extend({
  titles: organizationMembershipTitlesSchema.optional(),
})

/** Classification + identity fields mutable on normal organization edit. */
const organizationClassificationBodyFieldsSchema = mediaBearingAuthoredContentBodySchema.extend({
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
  })

/** Publish-complete organization body. */
export const organizationBodySchema = organizationBodyFieldsSchema

export type OrganizationBody = z.infer<typeof organizationBodySchema>

/** Draft organization body fields — domain may remain unset until publish. */
const organizationBodyDraftFieldsSchema = mediaBearingDraftAuthoredContentBodySchema(
  ORGANIZATION_CONTENT_TYPE_TERM.label,
)
  .extend(organizationClassificationDraftFieldsSchema.shape)
  .omit({ members: true })
  .extend({
    members: organizationMembersSchema.default(defaultOrganizationMembers),
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
  membershipTitleId: z.string().min(1).optional(),
  titleReferenceStatus: z.enum(['none', 'resolved', 'broken']).optional(),
  /** Resolved catalog label when `titleReferenceStatus` is `resolved`. */
  title: z.string().trim().min(1).max(80).optional(),
  priority: z.number().int().optional(),
  organization: z.union([organizationSchema, organizationDraftStoredSchema]).nullable(),
})

export type OrganizationReferenceResolution = z.infer<typeof organizationReferenceResolutionSchema>

export const createOrganizationInputSchema = organizationClassificationBodyFieldsSchema
  .omit({ members: true })
  .extend({
    slug: slugSchema,
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
  .omit({ connections: true })
  .extend({
    slug: slugSchema,
    organizationForm: organizationFormSchema.nullable().optional(),
    functions: organizationFunctionsSchema.optional(),
    practices: organizationPracticesSchema.optional(),
    members: organizationMembersUpdateSchema.optional(),
  })
  .partial()

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>

export const updateOrganizationDraftInputSchema = organizationBodyDraftFieldsSchema
  .omit({ connections: true })
  .extend({
    organizationForm: organizationFormSchema.nullable().optional(),
    functions: organizationFunctionsSchema.optional(),
    practices: organizationPracticesSchema.optional(),
    members: organizationMembersUpdateSchema.optional(),
  })
  .partial()

export type UpdateOrganizationDraftInput = z.infer<typeof updateOrganizationDraftInputSchema>
