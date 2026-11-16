import { z } from 'zod'

import {
  draftActionFields,
  omitActionKinds,
  omittedSectionKinds,
  publishedActionFields,
} from './schema-helpers'

export const monsterLegendaryActionSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(publishedActionFields, omittedSectionKinds('legendaryActions')),
)

export const monsterLegendaryActionDraftSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(draftActionFields, omittedSectionKinds('legendaryActions')),
)

export const monsterLegendaryActionsBlockSchema = z.object({
  uses: z.number().int().min(1),
  usesInLair: z.number().int().min(1).optional(),
  actions: z.array(monsterLegendaryActionSchema).min(1),
})

export const monsterLegendaryActionsBlockDraftSchema = z.object({
  uses: z.number().int().min(1).optional(),
  usesInLair: z.number().int().min(1).optional(),
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
