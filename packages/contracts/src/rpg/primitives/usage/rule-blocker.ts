import { z } from 'zod'

import { usageBlockerSourceKeySchema } from '../content/catalog-entity-usage-blocker'

export const ruleUsageBlockerArmSchema = z.object({
  kind: z.literal('rule'),
  code: z.string(),
  message: z.string(),
  sourceKey: usageBlockerSourceKeySchema.optional(),
})

export type RuleUsageBlockerArm = z.infer<typeof ruleUsageBlockerArmSchema>
