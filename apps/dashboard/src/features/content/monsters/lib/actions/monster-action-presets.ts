import type {
  MonsterActionDraft,
  MonsterBonusActionDraft,
  MonsterLegendaryActionDraft,
  MonsterReactionDraft,
} from '@rpg/contracts'

/** Editor row before normalization; union across all action sections. */
export type MonsterActionDraftRow =
  | MonsterActionDraft
  | MonsterBonusActionDraft
  | MonsterReactionDraft
  | MonsterLegendaryActionDraft

export { monsterActionSectionHeading } from '../monster-form-labels'
