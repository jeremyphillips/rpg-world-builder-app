import { z } from 'zod'

import { CONTENT_TYPE_KEYS } from '../content/content-type-keys'
import { usageBlockerSourceKeySchema } from './usage-blocker-source-key'

export const catalogEntityUsageBlockerArmSchema = z.object({
  kind: z.literal('content'),
  sourceKey: usageBlockerSourceKeySchema.optional(),
  contentTypeKey: z.enum(CONTENT_TYPE_KEYS),
  id: z.string(),
  label: z.string(),
  slug: z.string(),
})

export type CatalogEntityUsageBlockerArm = z.infer<typeof catalogEntityUsageBlockerArmSchema>
