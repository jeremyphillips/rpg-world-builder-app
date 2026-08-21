import { z } from 'zod'

import { absoluteLevelSchema } from '../../../primitives/level'
import { characterValidationMessages } from '../character-messages'
import { characterAbilityScoreSchema } from '../../../vocab/ability'
import { creatureRuntimeHitPointsSchema } from '../../../content/creature'

// ---------------------------------------------------------------------------
// Core identity and progression
// ---------------------------------------------------------------------------

export const CHARACTER_TYPES = ['pc', 'npc'] as const

export const characterTypeSchema = z.enum(CHARACTER_TYPES)

export type CharacterType = z.infer<typeof characterTypeSchema>

export const characterClassEntrySchema = z.object({
  /** Opaque class content id. */
  classId: z.string().min(1),
  /** Opaque subclass content id chosen for this class, when any. */
  subclassId: z.string().min(1).optional(),
  level: absoluteLevelSchema,
})

export type CharacterClassEntry = z.infer<typeof characterClassEntrySchema>

export const characterClassesSchema = z
  .array(characterClassEntrySchema)
  .min(1)
  .superRefine((entries, ctx) => {
    const seen = new Set<string>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.classId)) {
        ctx.addIssue({
          code: 'custom',
          message: characterValidationMessages.duplicateClass(),
          path: [index, 'classId'],
        })
      }

      seen.add(entry.classId)
    })
  })

/** NPC classes — empty array represents Level 0 classless NPCs. */
export const npcCharacterClassesSchema = z
  .array(characterClassEntrySchema)
  .superRefine((entries, ctx) => {
    const seen = new Set<string>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.classId)) {
        ctx.addIssue({
          code: 'custom',
          message: characterValidationMessages.duplicateClass(),
          path: [index, 'classId'],
        })
      }

      seen.add(entry.classId)
    })
  })

export const characterSpeciesSchema = z.object({
  /** Opaque species content id. */
  id: z.string().min(1),
  /** Selected embedded heritage/lineage option id, when the species offers one. */
  heritageId: z.string().min(1).optional(),
})

export type CharacterSpecies = z.infer<typeof characterSpeciesSchema>

export const characterAbilityScoresSchema = z.object({
  str: characterAbilityScoreSchema,
  dex: characterAbilityScoreSchema,
  con: characterAbilityScoreSchema,
  int: characterAbilityScoreSchema,
  wis: characterAbilityScoreSchema,
  cha: characterAbilityScoreSchema,
})

export type CharacterAbilityScores = z.infer<typeof characterAbilityScoresSchema>

export const characterHitPointsSchema = creatureRuntimeHitPointsSchema

export type CharacterHitPoints = z.infer<typeof characterHitPointsSchema>
