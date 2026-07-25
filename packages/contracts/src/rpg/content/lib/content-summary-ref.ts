import { z } from 'zod'

/** Minimal id+name reference for list/overview summaries. */
export const contentSummaryRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export type ContentSummaryRef = z.infer<typeof contentSummaryRefSchema>
