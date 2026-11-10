import type { MonsterActionDraft, MonsterReactionDraft } from '@rpg/contracts'

/** Editor row for actions, bonus actions, and reactions before normalization. */
export type MonsterActionDraftRow = MonsterActionDraft | MonsterReactionDraft

export function createMonsterRowId(): string {
  return crypto.randomUUID()
}

export { monsterActionSectionHeading } from '../monster-form-labels'
