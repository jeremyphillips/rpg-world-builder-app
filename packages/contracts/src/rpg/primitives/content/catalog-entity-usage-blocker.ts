import { z } from 'zod'

import { CONTENT_TYPE_KEYS } from './content-type-keys'

export const catalogEntityUsageBlockerArmSchema = z.object({
  kind: z.literal('content'),
  contentTypeKey: z.enum(CONTENT_TYPE_KEYS),
  id: z.string(),
  label: z.string(),
  slug: z.string(),
})

export type CatalogEntityUsageBlockerArm = z.infer<typeof catalogEntityUsageBlockerArmSchema>
