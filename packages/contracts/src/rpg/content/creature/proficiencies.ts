import { z } from 'zod'

import { languageIdSchema } from '../../vocab/language'

/** Monster / shared language proficiency row (`speaks` omitted when the creature speaks). */
export const creatureLanguageProficiencyEntrySchema = z.object({
  language: languageIdSchema,
  speaks: z.literal(false).optional(),
})

export type CreatureLanguageProficiencyEntry = z.infer<
  typeof creatureLanguageProficiencyEntrySchema
>
