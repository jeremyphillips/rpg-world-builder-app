import { z } from 'zod'

// ---------------------------------------------------------------------------
// Content choice — reusable pick-N-from-options shape for character creation
// and other builder-facing option sets (starting equipment, future backgrounds).
// ---------------------------------------------------------------------------

export const contentChoiceOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
})

export type ContentChoiceOption = z.infer<typeof contentChoiceOptionSchema>

export const contentChoiceSchema = z.object({
  choose: z.number().int().min(1).default(1),
  options: z.array(contentChoiceOptionSchema).min(1),
})

export type ContentChoice = z.infer<typeof contentChoiceSchema>
