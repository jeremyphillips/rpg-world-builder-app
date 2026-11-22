import type { z } from 'zod'

import { bonusTeleportPassengerSchema } from './shared-fragments'
export { monsterBonusActionSchema, monsterBonusActionDraftSchema } from './section-tuples'

export { bonusTeleportPassengerSchema }
export type { BonusTeleportPassenger } from './shared-fragments'

import { monsterBonusActionDraftSchema, monsterBonusActionSchema } from './section-tuples'

export type MonsterBonusAction = z.infer<typeof monsterBonusActionSchema>
export type MonsterBonusActionDraft = z.infer<typeof monsterBonusActionDraftSchema>
/** Authoring input before parse defaults; use on monster form bonus action rows. */
export type MonsterBonusActionDraftInput = z.input<typeof monsterBonusActionDraftSchema>
