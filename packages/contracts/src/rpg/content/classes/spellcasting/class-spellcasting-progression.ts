import { z } from 'zod'

import { classCapacityProgressionSchema } from './class-capacity-progression'

// ---------------------------------------------------------------------------
// Class spellcasting progression — independently stored sparse capacity curves.
// ---------------------------------------------------------------------------

export const classSpellcastingProgressionSchema = z.object({
  /** Cantrip selection capacity; absent when the class grants no cantrip picks. */
  cantrips: classCapacityProgressionSchema.optional(),
  /** Limited repertoire capacity (column label may still read "Prepared Spells"). */
  repertoire: classCapacityProgressionSchema.optional(),
  /** Prepare-from-list or prepare-from-collection capacity. */
  preparedSpells: classCapacityProgressionSchema.optional(),
})

export type ClassSpellcastingProgression = z.infer<typeof classSpellcastingProgressionSchema>
