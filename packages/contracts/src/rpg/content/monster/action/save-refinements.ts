import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import {
  effectResolutionFieldShape,
  effectResolutionMethodSchema,
  effectResolutionSchema,
  validateEffectResolution,
} from '../../lib/resolution/schema'
import { RESOLUTION_SELECTION_MODES } from '../../../vocab/resolution'
import {
  savingThrowEffectDraftSchema,
  savingThrowEffectSchema,
} from '../../lib/saving-throw/schema'
import type { MonsterActionMode } from './shared-fragments'

const monsterSaveSelectionMessage =
  'Saving throw actions select an area from self or creatures in reach or at a distance.'

export const monsterSaveResolutionSchema = z
  .object({
    ...effectResolutionFieldShape,
    selectionMode: z.enum(RESOLUTION_SELECTION_MODES, monsterSaveSelectionMessage),
    method: effectResolutionMethodSchema,
  })
  .strict()
  .superRefine(validateEffectResolution)

export function saveResolutionSchema<M extends MonsterActionMode>(mode: M) {
  const published = monsterSaveResolutionSchema
  const draft = effectResolutionSchema.optional()
  return (mode === 'draft' ? draft : published) as M extends 'draft'
    ? typeof draft
    : typeof published
}

export function savingThrowFieldSchema(mode: MonsterActionMode) {
  return mode === 'draft'
    ? savingThrowEffectDraftSchema.optional()
    : savingThrowEffectSchema.optional()
}

const MONSTER_SAVE_OUTCOME_RESULTS = new Set(['failed-save', 'successful-save'])

/** Rich-text shells such as `<p></p>` are not authored rules text. */
export const RULES_OR_SAVING_THROW_MESSAGE = 'Enter rules text or a saving throw.'

export function monsterRichTextIsEmpty(value: string): boolean {
  return (
    value
      .replace(/<br\s*\/?>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim().length === 0
  )
}

type MonsterSaveActionLike = {
  resolution?: {
    method: { kind: string }
    selectionMode: string
    target?: { kind: string; proximity: { kind: string } }
    areaOfEffect?: unknown
    effects: readonly { kind: string }[]
    outcomes: readonly { result: string }[]
  }
}

export function refineMonsterSaveResolution(
  action: MonsterSaveActionLike,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  const resolution = action.resolution
  if (!resolution) return
  if (resolution.method.kind !== 'saving-throw') {
    addCustomRefinementIssue(ctx, 'Saving throw actions require a saving throw.', [
      ...path,
      'resolution',
      'method',
      'kind',
    ])
  }
  const creatureInReach =
    resolution.selectionMode === 'targets' &&
    resolution.target?.kind === 'creature' &&
    (resolution.target.proximity.kind === 'reach' ||
      resolution.target.proximity.kind === 'distance')
  const areaFromSelf = resolution.selectionMode === 'self' && Boolean(resolution.areaOfEffect)
  if (!creatureInReach && !areaFromSelf) {
    addCustomRefinementIssue(
      ctx,
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
      [...path, 'resolution', 'selectionMode'],
    )
  }
  resolution.effects.forEach((effect, effectIndex) => {
    if (effect.kind === 'damage') return
    addCustomRefinementIssue(ctx, 'Saving throw actions can only deal damage.', [
      ...path,
      'resolution',
      'effects',
      effectIndex,
      'kind',
    ])
  })
  resolution.outcomes.forEach((outcome, outcomeIndex) => {
    if (MONSTER_SAVE_OUTCOME_RESULTS.has(outcome.result)) return
    addCustomRefinementIssue(ctx, 'Saving throw outcomes must be a failed or successful save.', [
      ...path,
      'resolution',
      'outcomes',
      outcomeIndex,
      'result',
    ])
  })
}
