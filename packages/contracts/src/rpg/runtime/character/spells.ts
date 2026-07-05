import { z } from 'zod'

import { spellPreparationModeSchema } from '../../content/classes/spellcasting'
import { characterSelectionSourcesSchema } from './selection-sources'

// ---------------------------------------------------------------------------
// Runtime spell list entries on a character sheet.
// ---------------------------------------------------------------------------

export const characterSpellEntrySchema = z.object({
  spellId: z.string().min(1),
  preparationState: spellPreparationModeSchema.optional(),
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterSpellEntry = z.infer<typeof characterSpellEntrySchema>
