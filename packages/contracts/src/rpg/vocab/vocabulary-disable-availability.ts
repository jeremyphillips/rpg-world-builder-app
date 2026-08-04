import { z } from 'zod'

import { usageBlockerSchema } from '../primitives/usage/usage-blocker'

/** Advisory preflight for disabling a vocabulary option (status → disabled). */
export const vocabularyDisableAvailabilitySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('allowed') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type VocabularyDisableAvailability = z.infer<typeof vocabularyDisableAvailabilitySchema>

/** Authoritative disable outcome — PATCH may return 409 with blockers on race. */
export const vocabularyDisableResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({
    status: z.literal('blocked'),
    blockers: z.array(usageBlockerSchema),
  }),
])

export type VocabularyDisableResult = z.infer<typeof vocabularyDisableResultSchema>

export type VocabularyUsageBlocker = z.infer<typeof usageBlockerSchema>
