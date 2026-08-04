import { z } from 'zod'

export const ruleUsageBlockerArmSchema = z.object({
  kind: z.literal('rule'),
  code: z.string(),
  message: z.string(),
})

export type RuleUsageBlockerArm = z.infer<typeof ruleUsageBlockerArmSchema>
