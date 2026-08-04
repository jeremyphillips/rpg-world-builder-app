import { z } from 'zod'

import { CONTENT_TYPE_KEYS } from './content-type-keys'

/** Catalog-entity usage reference — references a content catalog row by type + identity. */
export const catalogUsageReferenceSchema = z.object({
  kind: z.literal('content'),
  contentTypeKey: z.enum(CONTENT_TYPE_KEYS),
  id: z.string(),
  label: z.string(),
  slug: z.string(),
})

export type CatalogUsageReference = z.infer<typeof catalogUsageReferenceSchema>
