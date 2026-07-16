import { z } from 'zod'

import { alignmentSchema } from '../../vocab/alignment'
import {
  characterAbilityScoresSchema,
  characterClassesSchema,
  characterHitPointsSchema,
  characterSpeciesSchema,
} from './core'
import {
  characterEquipmentSchema,
  characterFeatEntrySchema,
  characterWealthSchema,
} from './equipment-inventory'
import { characterNarrativeSchema } from './narrative'
import { characterSpellEntrySchema } from './spells'
import { characterProficienciesSchema } from './proficiencies'

// ---------------------------------------------------------------------------
// Character — player characters and campaign-owned NPCs. This is a stored sheet
// contract, not a rules engine: totals and derived catalog grants are resolved by
// services/builders from class, species, feat, spell, and equipment content.
// ---------------------------------------------------------------------------

const characterBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  imageKey: z.string().optional(),
  rulesetId: z.string().min(1),
  classes: characterClassesSchema,
  species: characterSpeciesSchema,
  alignment: alignmentSchema,
  xp: z.number().int().min(0),
  abilityScores: characterAbilityScoresSchema,
  hitPoints: characterHitPointsSchema,
  proficiencies: characterProficienciesSchema,
  spells: z.array(characterSpellEntrySchema).default([]),
  equipment: characterEquipmentSchema,
  wealth: characterWealthSchema,
  narrative: characterNarrativeSchema.optional(),
  feats: z.array(characterFeatEntrySchema).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const pcCharacterSchema = characterBaseSchema.extend({
  characterType: z.literal('pc'),
  userId: z.string().min(1),
  campaignId: z.string().min(1).nullable().optional(),
})

export type PcCharacter = z.infer<typeof pcCharacterSchema>

export const npcCharacterSchema = characterBaseSchema.extend({
  characterType: z.literal('npc'),
  campaignId: z.string().min(1),
  userId: z.never().optional(),
})

export type NpcCharacter = z.infer<typeof npcCharacterSchema>

export const characterSchema = z.discriminatedUnion('characterType', [
  pcCharacterSchema,
  npcCharacterSchema,
])

export type Character = z.infer<typeof characterSchema>

export function getCharacterTotalLevel(character: Pick<Character, 'classes'>): number {
  return character.classes.reduce((total, entry) => total + entry.level, 0)
}
