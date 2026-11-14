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

export type MonsterLegendaryAction = z.infer<typeof monsterLegendaryActionSchema>
export type MonsterLegendaryActionDraft = z.infer<typeof monsterLegendaryActionDraftSchema>
