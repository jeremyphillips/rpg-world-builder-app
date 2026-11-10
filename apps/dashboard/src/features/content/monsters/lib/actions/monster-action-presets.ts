import type { z } from 'zod'
import type { monsterReactionDraftSchema, MonsterActionKind } from '@rpg/contracts'

type ReactionDraftInput = z.input<typeof monsterReactionDraftSchema>
type DraftVariant<K extends MonsterActionKind> = Partial<
  Omit<Extract<ReactionDraftInput, { kind: K }>, 'id' | 'kind'>
>

/**
 * Editor row. Fields come from the reaction draft schema, flattened so a row can
 * hold the active kind's values before normalization drops the rest.
 */
export type MonsterActionDraftRow = {
  id: string
  kind: MonsterActionKind
} & DraftVariant<'weapon'> &
  DraftVariant<'natural-weapon'> &
  DraftVariant<'attack'> &
  DraftVariant<'special'> &
  DraftVariant<'spell'> &
  DraftVariant<'save'> &
  DraftVariant<'multiattack'>

export { monsterActionSectionHeading } from '../monster-form-labels'
