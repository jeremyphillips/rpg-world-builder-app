import { z } from 'zod'

export const activationTriggerSchema = z.object({
  /** Authored eligibility prose. A future machine-readable `event` sits beside it. */
  text: z.string().min(1),
})

export type ActivationTrigger = z.infer<typeof activationTriggerSchema>
