import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../shared/paginated-items'

/** Transport summary for a character sheet row. Not a UI view model. */
export const characterSummaryDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string(),
})

export type CharacterSummaryDto = z.infer<typeof characterSummaryDtoSchema>

/** A character that references campaign content from its saved sheet. */
export const referencingCharacterSummarySchema = z.object({
  characterType: z.enum(['pc', 'npc']),
  character: characterSummaryDtoSchema,
})

export type ReferencingCharacterSummary = z.infer<typeof referencingCharacterSummarySchema>

export const organizationConnectedCharactersResponseSchema = paginatedItemsSchema(
  referencingCharacterSummarySchema,
)

/** Organization detail reverse membership read — open-participation characters with saved org refs. */
export type OrganizationConnectedCharactersResponse = PaginatedItems<ReferencingCharacterSummary>
