import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../lib/paginated-items'

import { characterCardSummarySchema } from './character-card-dtos'

/** Transport summary for a character sheet row. Not a UI view model. */
export const characterSummaryDtoSchema = characterCardSummarySchema

export type CharacterSummaryDto = z.infer<typeof characterSummaryDtoSchema>

/** A character that references campaign content from its saved sheet. */
export const referencingCharacterSummarySchema = z.object({
  characterType: z.enum(['pc', 'npc']),
  character: characterCardSummarySchema,
})

export type ReferencingCharacterSummary = z.infer<typeof referencingCharacterSummarySchema>

/** Organization roster membership fields projected onto a member row. */
export const organizationMemberMembershipSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  /** Effective presentation priority used for roster ordering (persisted or canonical fallback). */
  priority: z.number().int().optional(),
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
