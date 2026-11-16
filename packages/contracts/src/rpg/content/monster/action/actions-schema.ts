import { z } from 'zod'

import {
  draftActionFields,
  omitActionKinds,
  omittedSectionKinds,
  publishedActionFields,
} from './schema-helpers'

export const monsterActionSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(publishedActionFields, omittedSectionKinds('actions')),
)

export const monsterActionDraftSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(draftActionFields, omittedSectionKinds('actions')),
)

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>
/** Authoring input before parse defaults; use on monster form action rows. */
export type MonsterActionDraftInput = z.input<typeof monsterActionDraftSchema>
