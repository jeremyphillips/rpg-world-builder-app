import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../../lib/paginated-items'
import { organizationPresetNpcRecommendationSchema } from '../../../content/organization/membership-titles'
import { organizationMembershipTitlePrioritySchema } from '../../../content/organization/membership-titles'

import { referencingCharacterSummarySchema } from '../summary/referencing-summary'
import { ORGANIZATION_MEMBERSHIP_TITLE_REFERENCE_STATUSES } from './membership-title-projection'

/** Organization roster membership fields projected onto a member row. */
export const organizationMemberMembershipSchema = z.object({
  membershipTitleId: z.string().min(1).optional(),
  titleReferenceStatus: z.enum(ORGANIZATION_MEMBERSHIP_TITLE_REFERENCE_STATUSES),
  /** Resolved catalog label — absent for none/broken. */
  title: z.string().trim().min(1).max(80).optional(),
  /** Resolved catalog priority — absent when unranked (none/broken). */
  priority: organizationMembershipTitlePrioritySchema.optional(),
  npcRecommendation: organizationPresetNpcRecommendationSchema.optional(),
})

export type OrganizationMemberMembership = z.infer<typeof organizationMemberMembershipSchema>

/** Organization detail Members row — character card plus membership metadata. */
export const organizationMemberSummarySchema = referencingCharacterSummarySchema.extend({
  membership: organizationMemberMembershipSchema,
})

export type OrganizationMemberSummary = z.infer<typeof organizationMemberSummarySchema>

export const organizationMembersResponseSchema = paginatedItemsSchema(
  organizationMemberSummarySchema,
)

/** Organization detail Members read — sorted membership roster. */
export type OrganizationMembersResponse = PaginatedItems<OrganizationMemberSummary>
