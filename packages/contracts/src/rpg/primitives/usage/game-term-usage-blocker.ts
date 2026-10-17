import { z } from 'zod'

import { usageBlockerSourceKeySchema } from './usage-blocker-source-key'

export const gameTermUsageBlockerArmSchema = z.object({
  kind: z.literal('game-term'),
  sourceKey: usageBlockerSourceKeySchema.optional(),
  setId: z.string(),
  id: z.string(),
  label: z.string(),
})

export type GameTermUsageBlockerArm = z.infer<typeof gameTermUsageBlockerArmSchema>
