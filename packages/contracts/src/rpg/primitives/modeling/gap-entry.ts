import { z } from 'zod'

/** Domain-neutral modeling gap entry — spell and future content types share this shape. */
export const modelingGapEntrySchema = z.object({
  code: z.string().min(1),
  note: z.string().optional(),
  capabilityId: z.string().optional(),
})

export type ModelingGapEntry = z.infer<typeof modelingGapEntrySchema>
