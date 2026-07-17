import { z } from 'zod'

import { usageFrequencySchema } from '../../vocab/usage-frequency'
import { characterSelectionSourcesSchema } from './selection-sources'

// ---------------------------------------------------------------------------
// Runtime spell list entries on a character sheet.
// ---------------------------------------------------------------------------

export const characterSpellAccessSchema = z.object({
  classKnown: z.boolean().optional(),
  alwaysPrepared: z.boolean().optional(),
  granted: z.boolean().optional(),
})

export type CharacterSpellAccess = z.infer<typeof characterSpellAccessSchema>

export const characterSpellSelectionSchema = z.object({
  prepared: z.boolean(),
})

export type CharacterSpellSelection = z.infer<typeof characterSpellSelectionSchema>

export const characterSpellCastingEntitlementSchema = z.object({
  mode: z.literal('free_cast'),
  frequency: usageFrequencySchema,
  allowsSlotCasting: z.boolean(),
  sources: characterSelectionSourcesSchema,
})

export type CharacterSpellCastingEntitlement = z.infer<
  typeof characterSpellCastingEntitlementSchema
>

export const characterSpellEntrySchema = z.object({
  spellId: z.string().min(1),
  sources: characterSelectionSourcesSchema,
  access: characterSpellAccessSchema,
  selection: characterSpellSelectionSchema.optional(),
  castingEntitlements: z.array(characterSpellCastingEntitlementSchema).optional(),
  notes: z.string().optional(),
})

export type CharacterSpellEntry = z.infer<typeof characterSpellEntrySchema>
