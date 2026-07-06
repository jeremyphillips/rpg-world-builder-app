import { z } from 'zod'

import { equipmentModifierSchema } from '../../content/equipment/modifier'
import { characterSelectionSourcesSchema } from './selection-sources'

// ---------------------------------------------------------------------------
// Spells, equipment, wealth, feats, and narrative
// ---------------------------------------------------------------------------

export const CHARACTER_SPELL_PREPARATION_STATES = ['known', 'prepared', 'always_prepared'] as const

export const characterSpellPreparationStateSchema = z.enum(CHARACTER_SPELL_PREPARATION_STATES)

export type CharacterSpellPreparationState = z.infer<typeof characterSpellPreparationStateSchema>

export const characterSpellEntrySchema = z.object({
  spellId: z.string().min(1),
  preparationState: characterSpellPreparationStateSchema.optional(),
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterSpellEntry = z.infer<typeof characterSpellEntrySchema>

export const characterEquipmentEntrySchema = z.object({
  /** Optional stable row id for duplicate or customized copies of the same item. */
  entryId: z.string().min(1).optional(),
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  attuned: z.boolean().optional(),
  customName: z.string().min(1).optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterEquipmentEntry = z.infer<typeof characterEquipmentEntrySchema>

export const characterEquipmentSchema = z.object({
  weapons: z.array(characterEquipmentEntrySchema).default([]),
  armor: z.array(characterEquipmentEntrySchema).default([]),
  tools: z.array(characterEquipmentEntrySchema).default([]),
  gear: z.array(characterEquipmentEntrySchema).default([]),
  magicItems: z.array(characterEquipmentEntrySchema).default([]),
  vehicles: z.array(characterEquipmentEntrySchema).default([]),
  mounts: z.array(characterEquipmentEntrySchema).default([]),
})

export type CharacterEquipment = z.infer<typeof characterEquipmentSchema>

export const characterWealthSchema = z.object({
  cp: z.number().int().min(0).default(0),
  sp: z.number().int().min(0).default(0),
  gp: z.number().int().min(0).default(0),
  pp: z.number().int().min(0).default(0),
})

export type CharacterWealth = z.infer<typeof characterWealthSchema>

export const characterFeatEntrySchema = z.object({
  featId: z.string().min(1),
  sources: characterSelectionSourcesSchema,
  choices: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
})

export type CharacterFeatEntry = z.infer<typeof characterFeatEntrySchema>

export const characterNarrativeSchema = z.object({
  personalityTraits: z.array(z.string().min(1)).optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  backstory: z.string().optional(),
})

export type CharacterNarrative = z.infer<typeof characterNarrativeSchema>
