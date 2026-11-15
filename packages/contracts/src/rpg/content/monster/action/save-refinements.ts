import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import {
  effectResolutionFieldShape,
  effectResolutionMethodSchema,
  refineRepeatSaveSecondFailureForPublish,
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

const monsterSaveResolutionCore = z
  .object({
    ...effectResolutionFieldShape,
    selectionMode: z.enum(RESOLUTION_SELECTION_MODES, monsterSaveSelectionMessage),
    method: effectResolutionMethodSchema,
  })
  .strict()
  .superRefine(validateEffectResolution)

export const monsterSaveResolutionSchema = monsterSaveResolutionCore
  .superRefine(refineRepeatSaveSecondFailureForPublish)
  .superRefine(refineMonsterSaveDamageLinkage)

export const monsterSaveResolutionDraftSchema = z
  .object({
    ...effectResolutionFieldShape,
    selectionMode: z.enum(RESOLUTION_SELECTION_MODES, monsterSaveSelectionMessage),
    method: effectResolutionMethodSchema,
  })
  .strict()
  .superRefine((value, ctx) =>
    validateEffectResolution(value, ctx, { requireKnownEffectIds: false }),
  )
  .superRefine(refineMonsterSaveDamageLinkage)

export function saveResolutionSchema<M extends MonsterActionMode>(mode: M) {
  const published = monsterSaveResolutionSchema
  const draft = monsterSaveResolutionDraftSchema.optional()
  return (mode === 'draft' ? draft : published) as M extends 'draft'
    ? typeof draft
    : typeof published
}

export function savingThrowFieldSchema(mode: MonsterActionMode) {
  return mode === 'draft'
    ? savingThrowEffectDraftSchema.optional()
    : savingThrowEffectSchema.optional()
}

const MONSTER_SAVE_OUTCOME_RESULTS = new Set([
  'failed-save',
  'successful-save',
  'failed-or-successful-save',
])

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
    effects: readonly { id?: string; kind: string }[]
    outcomes: readonly {
      result: string
      effects?: readonly { kind: string; effectId?: string; amount?: string }[]
    }[]
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

type SaveLinkageEffect = { id?: string; kind: string }
type SaveLinkageReference = { kind: string; effectId?: string; amount?: string }
type SaveLinkageOutcome = { result: string; effects?: readonly SaveLinkageReference[] }

function damageIdsReferenced(
  outcome: SaveLinkageOutcome | undefined,
  damageIds: ReadonlySet<string>,
): Map<string, number> {
  const indexes = new Map<string, number>()
  outcome?.effects?.forEach((effect, index) => {
    if (effect.kind !== 'effect-reference' || !effect.effectId) return
    if (!damageIds.has(effect.effectId)) return
    if (!indexes.has(effect.effectId)) indexes.set(effect.effectId, index)
  })
  return indexes
}

/** Failed and successful saves reference the same damage definitions; failed amount is full. */
function refineMonsterSaveDamageLinkage(
  resolution: {
    effects: readonly SaveLinkageEffect[]
    outcomes: readonly SaveLinkageOutcome[]
  },
  ctx: z.RefinementCtx,
): void {
  const damageIds = new Set(
    resolution.effects.flatMap((effect) =>
      effect.kind === 'damage' && effect.id ? [effect.id] : [],
    ),
  )
  const failedIndex = resolution.outcomes.findIndex((outcome) => outcome.result === 'failed-save')
  const successIndex = resolution.outcomes.findIndex(
    (outcome) => outcome.result === 'successful-save',
  )
  const failed = failedIndex >= 0 ? resolution.outcomes[failedIndex] : undefined
  const success = successIndex >= 0 ? resolution.outcomes[successIndex] : undefined
  const failedRefs = damageIdsReferenced(failed, damageIds)
  const successRefs = damageIdsReferenced(success, damageIds)

  failed?.effects?.forEach((effect, effectIndex) => {
    if (effect.kind !== 'effect-reference' || !effect.effectId) return
    if (!damageIds.has(effect.effectId)) return
    if (effect.amount === 'full') return
    addCustomRefinementIssue(ctx, 'Failed save damage is the full amount.', [
      'outcomes',
      failedIndex,
      'effects',
      effectIndex,
      'amount',
    ])
  })

  resolution.effects.forEach((effect, effectIndex) => {
    if (effect.kind !== 'damage' || !effect.id) return
    if (failedRefs.has(effect.id)) return
    addCustomRefinementIssue(ctx, 'Each damage definition is referenced by the failed save.', [
      'effects',
      effectIndex,
    ])
  })

  for (const [effectId, effectIndex] of failedRefs) {
    if (successRefs.has(effectId)) continue
    addCustomRefinementIssue(
      ctx,
      'Successful save must reference each failed-save damage definition.',
      ['outcomes', failedIndex, 'effects', effectIndex, 'effectId'],
    )
  }

  for (const [effectId, effectIndex] of successRefs) {
    if (failedRefs.has(effectId)) continue
    addCustomRefinementIssue(
      ctx,
      'Successful save damage must match a failed-save damage definition.',
      ['outcomes', successIndex, 'effects', effectIndex, 'effectId'],
    )
  }
}
