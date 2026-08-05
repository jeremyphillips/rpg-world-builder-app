import { z } from 'zod'

import { locationDraftStoredSchema, locationSchema } from '../../content/location/location'
import { characterLocationConnectionSchema } from './location-connection'

/** Saved-reference read result; null preserves an explicitly missing/deleted reference. */
export const characterLocationReferenceResolutionSchema = z.object({
  connection: characterLocationConnectionSchema,
  location: z.union([locationSchema, locationDraftStoredSchema]).nullable(),
})

export type CharacterLocationReferenceResolution = z.infer<
  typeof characterLocationReferenceResolutionSchema
>

export const characterLocationReferenceListSchema = z.object({
  locationReferences: z.array(characterLocationReferenceResolutionSchema),
})

export type CharacterLocationReferenceList = z.infer<typeof characterLocationReferenceListSchema>
