import { z } from 'zod'

import { absoluteLevelSchema } from '../../../primitives/level'

export const SPELL_RECOMMENDATION_TARGETS = ['cantrips', 'level1Plus'] as const

export const spellRecommendationTargetSchema = z.enum(SPELL_RECOMMENDATION_TARGETS)

export type SpellRecommendationTarget = z.infer<typeof spellRecommendationTargetSchema>

export const spellRecommendationSchema = z.object({
  target: spellRecommendationTargetSchema,
  classLevel: absoluteLevelSchema.optional(),
  spellLevel: z.number().int().min(0).max(9).optional(),
  spellIds: z.array(z.string().min(1)).min(1),
})

export type SpellRecommendation = z.infer<typeof spellRecommendationSchema>
