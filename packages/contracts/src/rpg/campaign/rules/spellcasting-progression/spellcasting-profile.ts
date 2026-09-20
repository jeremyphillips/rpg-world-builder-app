import { z } from 'zod'

import { spellChoiceProgressionSchema } from './spell-choice-progression'
import { refineSpellcastingProfile } from './validation'

// ---------------------------------------------------------------------------
// Spellcasting profile — composes slot progression + choice progressions.
// ---------------------------------------------------------------------------

export const spellcastingProfileSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    slotProgressionId: z.string().min(1),
    choiceProgressions: z.array(spellChoiceProgressionSchema).default([]),
  })
  .superRefine((profile, ctx) => {
    refineSpellcastingProfile(profile, ctx)
  })

export type SpellcastingProfile = z.infer<typeof spellcastingProfileSchema>
