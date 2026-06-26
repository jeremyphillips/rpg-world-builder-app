import { z } from 'zod'

// ---------------------------------------------------------------------------
// Content choice — reusable pick-N-from-options shape for character creation
// and other builder-facing option sets (starting equipment, species heritage,
// future backgrounds).
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

/**
 * Named choice group — extends {@link contentChoiceSchema} with stable group
 * metadata for embedded character-creation picks (species heritage, etc.).
 * Option payloads are domain-specific (`contentTraitSchema`, starting items, …).
 */
export const contentNamedChoiceSchema = contentChoiceSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
})

export type ContentNamedChoice = z.infer<typeof contentNamedChoiceSchema>

/** Display title for choice rows that use `label` (package options) or `name` (traits). */
export function choiceOptionTitle(option: { id: string; label?: string; name?: string }): string {
  return option.label ?? option.name ?? option.id
}
