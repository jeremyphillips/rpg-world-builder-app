import { z } from 'zod'

export const dndBeyondPreviewInputSchema = z.object({
  input: z.string().trim().min(1, 'Character ID or URL is required.'),
})

export type DndBeyondPreviewInput = z.infer<typeof dndBeyondPreviewInputSchema>
