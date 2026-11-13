import type {
  MonsterActionDraft,
  MonsterBonusActionDraft,
  MonsterLegendaryActionDraft,
  MonsterReactionDraft,
} from '@rpg/contracts'

/** Editor row for an action section before normalization. */
export type MonsterActionDraftRow =
  | MonsterActionDraft
  | MonsterBonusActionDraft
  | MonsterReactionDraft
  | MonsterLegendaryActionDraft

export { monsterActionSectionHeading } from '../monster-form-labels'
