import { z } from 'zod'

export const monsterLairExperienceModeSchema = z.enum(['suggested', 'custom'])

export const monsterLairExperienceSchema = z.object({
  mode: monsterLairExperienceModeSchema,
  value: z.number().int().min(0).optional(),
})

export const monsterLairExperienceDraftSchema = monsterLairExperienceSchema

export const monsterLairSchema = z.object({
  enabled: z.boolean(),
  experience: monsterLairExperienceSchema.optional(),
})

export const monsterLairDraftSchema = z.object({
  enabled: z.boolean().optional(),
  experience: monsterLairExperienceDraftSchema.optional(),
})

export type MonsterLair = z.infer<typeof monsterLairSchema>
export type MonsterLairDraft = z.infer<typeof monsterLairDraftSchema>
