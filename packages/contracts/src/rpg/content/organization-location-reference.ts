import { z } from 'zod'

import { locationDraftStoredSchema, locationSchema } from './location/location'
import { organizationLocationConnectionSchema } from './organization-location-connection'

/** Saved-reference read result; null preserves an explicitly missing/deleted reference. */
export const organizationLocationReferenceResolutionSchema = z.object({
  connection: organizationLocationConnectionSchema,
  location: z.union([locationSchema, locationDraftStoredSchema]).nullable(),
})

export type OrganizationLocationReferenceResolution = z.infer<
  typeof organizationLocationReferenceResolutionSchema
>

export const organizationLocationReferenceListSchema = z.object({
  locationReferences: z.array(organizationLocationReferenceResolutionSchema),
})

export type OrganizationLocationReferenceList = z.infer<
  typeof organizationLocationReferenceListSchema
>
