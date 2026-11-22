import { z } from 'zod'

import {
  contextualCountDraftSchema,
  contextualCountSchema,
} from '../../../primitives/contextual-count'
import { monsterLegendaryActionDraftSchema, monsterLegendaryActionSchema } from './section-tuples'

export { monsterLegendaryActionSchema, monsterLegendaryActionDraftSchema }

export const monsterLegendaryActionsBlockSchema = z.object({
  uses: contextualCountSchema,
  actions: z.array(monsterLegendaryActionSchema).min(1),
})

export const monsterLegendaryActionsBlockDraftSchema = z.object({
  uses: contextualCountDraftSchema.optional(),
  actions: z.array(monsterLegendaryActionDraftSchema).default([]),
})

export type MonsterLegendaryActionsBlock = z.infer<typeof monsterLegendaryActionsBlockSchema>
export type MonsterLegendaryActionsBlockDraft = z.infer<
  typeof monsterLegendaryActionsBlockDraftSchema
>

export type MonsterLegendaryAction = z.infer<typeof monsterLegendaryActionSchema>
export type MonsterLegendaryActionDraft = z.infer<typeof monsterLegendaryActionDraftSchema>
/** Authoring input before parse defaults; use on monster form legendary action rows. */
export type MonsterLegendaryActionDraftInput = z.input<typeof monsterLegendaryActionDraftSchema>
