import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character narrative — personality, ideals, bonds, flaws, and backstory.
// ---------------------------------------------------------------------------

const narrativeStringArraySchema = z.array(z.string().min(1))

export const characterNarrativeSchema = z.object({
  personalityTraits: narrativeStringArraySchema.optional(),
  ideals: narrativeStringArraySchema.optional(),
  bonds: narrativeStringArraySchema.optional(),
  flaws: narrativeStringArraySchema.optional(),
  /** Rich text / serialized editor content. */
  backstory: z.string().optional(),
})

export type CharacterNarrative = z.infer<typeof characterNarrativeSchema>
