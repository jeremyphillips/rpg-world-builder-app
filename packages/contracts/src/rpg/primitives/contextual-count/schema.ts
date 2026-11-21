import { z } from 'zod'

/** Shared total use counts for normal and in-lair encounter contexts. */
export const contextualCountSchema = z.object({
  normal: z.number().int().min(1),
  inLair: z.number().int().min(1).optional(),
})

export const contextualCountDraftSchema = z.object({
  normal: z.number().int().min(1).optional(),
  inLair: z.number().int().min(1).optional(),
})

export type ContextualCount = z.infer<typeof contextualCountSchema>
export type ContextualCountDraft = z.infer<typeof contextualCountDraftSchema>
