import { z } from 'zod'

/** Shared limitation fields for blockers and residual gap entries. */
export const modelingLimitationFieldsSchema = z.object({
  code: z.string().min(1),
  note: z.string().optional(),
  capabilityId: z.string().optional(),
})

/** Domain-neutral modeling gap entry — spell and future content types share this shape. */
export const modelingGapEntrySchema = modelingLimitationFieldsSchema

export type ModelingGapEntry = z.infer<typeof modelingGapEntrySchema>

/** Single highest-priority limitation preventing the next modeling status rung. */
export const modelingBlockerSchema = modelingLimitationFieldsSchema

export type ModelingBlocker = z.infer<typeof modelingBlockerSchema>
