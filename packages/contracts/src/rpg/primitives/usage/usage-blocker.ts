import { z } from 'zod'

import { catalogEntityUsageBlockerArmSchema } from '../content/catalog-entity-usage-blocker'
import { characterUsageReferenceSchema } from './character-usage-reference'
import { ruleUsageBlockerArmSchema } from './rule-blocker'

/** Shared usage blocker union — identical wire shape for content and vocabulary guards. */
export const usageBlockerSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('usage'),
    usage: characterUsageReferenceSchema,
  }),
  catalogEntityUsageBlockerArmSchema,
  ruleUsageBlockerArmSchema,
])

export type UsageBlocker = z.infer<typeof usageBlockerSchema>
