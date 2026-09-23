import { z } from 'zod'

/** One attachment within a record's ordered media gallery. */
export const contentImageSchema = z
  .object({
    id: z.string().min(1),
    assetId: z.string().min(1),
    alt: z.string().optional(),
  })
  .strict()

export type ContentImage = z.infer<typeof contentImageSchema>
