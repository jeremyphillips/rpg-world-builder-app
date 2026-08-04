import { z } from 'zod'

import { USAGE_BLOCKER_SOURCE_KEY_VALUES } from '../usage/usage-blocker-source-key'

import { CONTENT_TYPE_KEYS } from './content-type-keys'

export const usageBlockerSourceKeySchema = z.enum(USAGE_BLOCKER_SOURCE_KEY_VALUES)

export const catalogEntityUsageBlockerArmSchema = z.object({
  kind: z.literal('content'),
  sourceKey: usageBlockerSourceKeySchema.optional(),
  contentTypeKey: z.enum(CONTENT_TYPE_KEYS),
  id: z.string(),
  label: z.string(),
  slug: z.string(),
})

export type CatalogEntityUsageBlockerArm = z.infer<typeof catalogEntityUsageBlockerArmSchema>
