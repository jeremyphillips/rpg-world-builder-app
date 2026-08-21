import { z } from 'zod'

import { catalogEntityUsageBlockerArmSchema } from './catalog-entity-usage-blocker'
import { usageBlockerSourceKeySchema } from './usage-blocker-source-key'
import { characterUsageReferenceSchema } from './character-usage-reference'
import { ruleUsageBlockerArmSchema } from './rule-blocker'

/** Shared usage blocker union — identical wire shape for content and vocabulary guards. */
export const usageBlockerSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('usage'),
    sourceKey: usageBlockerSourceKeySchema.optional(),
    usage: characterUsageReferenceSchema,
  }),
  catalogEntityUsageBlockerArmSchema,
  ruleUsageBlockerArmSchema,
])

export type UsageBlocker = z.infer<typeof usageBlockerSchema>
