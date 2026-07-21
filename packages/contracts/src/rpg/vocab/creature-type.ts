import type { z } from 'zod'

import type { VocabularyTerm } from './types'
import { vocabularyOptionIdSchema, type VocabularyOptionSetId } from './vocabulary'

// ---------------------------------------------------------------------------
// Creature types — SRD 5.2.1 taxonomy shared by species, monsters, and character
// sheets. Seed data lives in `@rpg/catalog/vocabulary`; campaign rules may
// restrict which types are allowed on character sheets (PC and NPC).
// ---------------------------------------------------------------------------

export const CREATURE_TYPE_TERM = {
  label: 'Creature Type',
  description: 'Taxonomic classification shared by species and monsters.',
  sentence: {
    singular: 'creature type',
    plural: 'creature types',
  },
} as const satisfies VocabularyTerm

export const CREATURE_TYPE_SET_ID = 'creature-types' as const satisfies VocabularyOptionSetId

/**
 * Primitive shape for stored creature type ids. Catalog membership is validated
 * against the campaign-resolved vocabulary, not the system seed list alone.
 */
export const creatureTypeSchema = vocabularyOptionIdSchema

export type CreatureTypeId = z.infer<typeof creatureTypeSchema>
