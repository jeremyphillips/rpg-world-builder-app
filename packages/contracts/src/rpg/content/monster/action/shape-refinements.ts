import { type z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { getActionPreset } from '../../action/action-presets'
import { monsterActionAuthoring } from '../monster-action-authoring'
import type { MonsterAction, MonsterActionDraft } from './actions-schema'
import type { MonsterBonusAction, MonsterBonusActionDraft } from './bonus-schema'
import type { MonsterLegendaryAction, MonsterLegendaryActionDraft } from './legendary-schema'
import type { MonsterReaction, MonsterReactionDraft } from './reaction-schema'
import {
  monsterRichTextIsEmpty,
  refineMonsterSaveResolution,
  RULES_OR_SAVING_THROW_MESSAGE,
} from './save-refinements'

function refineNaturalWeaponShape(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'natural-weapon' }>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.mode === 'ranged' && !action.range) {
    addCustomRefinementIssue(ctx, 'Ranged natural weapons require range.', [...path, 'range'])
  }
  if (action.mode === 'ranged' && action.reach !== undefined) {
    addCustomRefinementIssue(ctx, 'Reach is only allowed on melee natural weapons.', [
      ...path,
      'reach',
    ])
  }
}

function refineAuthoredAttackShape(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'attack' }>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (!action.modes) return
  if (new Set(action.modes).size !== action.modes.length) {
    addCustomRefinementIssue(ctx, 'Attack modes must be unique.', [...path, 'modes'])
  }
  if (action.modes.includes('ranged') && !action.range) {
    addCustomRefinementIssue(ctx, 'Ranged attacks require range.', [...path, 'range'])
  }
  if (!action.modes.includes('melee') && action.reach !== undefined) {
    addCustomRefinementIssue(ctx, 'Reach is only allowed when the attack is melee.', [
      ...path,
      'reach',
    ])
  }
}

function refineUnknownPreset(
  action: { preset?: string },
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.preset && !getActionPreset(action.preset)) {
    addCustomRefinementIssue(ctx, 'Unknown action preset.', [...path, 'preset'])
  }
}

function refineAuthoredActionName(
  action:
    | MonsterAction
    | MonsterBonusAction
    | MonsterReaction
    | MonsterLegendaryAction
    | MonsterActionDraft
    | MonsterBonusActionDraft
    | MonsterReactionDraft
    | MonsterLegendaryActionDraft,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind === 'action-reference') return
  if (monsterActionAuthoring(action).name === 'authored' && !action.name?.trim()) {
    addCustomRefinementIssue(ctx, 'Name is required.', [...path, 'name'])
  }
}

function refineSpecialRulesText(
  action:
    | MonsterAction
    | MonsterBonusAction
    | MonsterReaction
    | MonsterLegendaryAction
    | MonsterActionDraft
    | MonsterBonusActionDraft
    | MonsterReactionDraft
    | MonsterLegendaryActionDraft,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind !== 'special') return
  const text = typeof action.description === 'string' ? action.description : ''
  const hasSave = action.savingThrow != null
  if ((text.length === 0 || monsterRichTextIsEmpty(text)) && !hasSave) {
    addCustomRefinementIssue(ctx, RULES_OR_SAVING_THROW_MESSAGE, [...path, 'description'])
  }
}

export function refineMonsterActionShape(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  refineUnknownPreset(action as { preset?: string }, ctx, path)
  refineAuthoredActionName(action, ctx, path)
  refineSpecialRulesText(action, ctx, path)
  if (action.kind === 'natural-weapon') refineNaturalWeaponShape(action, ctx, path)
  if (action.kind === 'attack') refineAuthoredAttackShape(action, ctx, path)
  if (action.kind === 'save') refineMonsterSaveResolution(action, ctx, path)
}
