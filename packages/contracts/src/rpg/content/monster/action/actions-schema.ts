import type { z } from 'zod'

export { monsterActionSchema, monsterActionDraftSchema } from './section-tuples'

import { monsterActionDraftSchema, monsterActionSchema } from './section-tuples'

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>
/** Authoring input before parse defaults; use on monster form action rows. */
export type MonsterActionDraftInput = z.input<typeof monsterActionDraftSchema>
