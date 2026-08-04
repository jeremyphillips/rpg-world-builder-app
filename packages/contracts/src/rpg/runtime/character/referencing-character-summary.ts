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

export const organizationConnectedCharactersResponseSchema = paginatedItemsSchema(
  referencingCharacterSummarySchema,
)

/** Organization detail reverse membership read — open-participation characters with saved org refs. */
export type OrganizationConnectedCharactersResponse = PaginatedItems<ReferencingCharacterSummary>
