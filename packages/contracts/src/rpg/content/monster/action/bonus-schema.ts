import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { limitedUseDraftSchema, limitedUseSchema } from '../../../primitives/limited-use'
import { entryProvenanceField } from '../../../primitives/provenance'
import { refineRequirementsForTargetKind } from '../../lib/resolution/target-requirements'
import {
  BONUS_ACTION_COMBINATIONS,
  BONUS_STANDARD_ACTION_IDS,
  LEAP_DISTANCE_EXCEEDS_MOVEMENT_MESSAGE,
  LEAP_DISTANCE_MAX,
  LEAP_MOVEMENT_MAX,
} from '../bonus-standard-actions'
import {
  draftActionFields,
  omitActionKinds,
  omittedSectionKinds,
  publishedActionFields,
  strict,
} from './schema-helpers'
import {
  bonusTeleportPassengerSchema,
  positiveWholeFeetSchema,
  type MonsterActionMode,
} from './shared-fragments'

const leapDistanceFeetSchema = positiveWholeFeetSchema.max(LEAP_DISTANCE_MAX)
const leapMovementFeetSchema = positiveWholeFeetSchema.max(LEAP_MOVEMENT_MAX)

export { bonusTeleportPassengerSchema }
export type { BonusTeleportPassenger } from './shared-fragments'

function bonusLimitedUse<M extends MonsterActionMode>(mode: M) {
  return (mode === 'draft' ? limitedUseDraftSchema : limitedUseSchema) as M extends 'draft'
    ? typeof limitedUseDraftSchema
    : typeof limitedUseSchema
}

function leapSchema<M extends MonsterActionMode>(mode: M) {
  return z
    .object({
      id: z.string().min(1),
      kind: z.literal('leap'),
      name: strict(z.string().min(1), mode),
      distanceFeet: strict(leapDistanceFeetSchema, mode),
      movementFeet: strict(leapMovementFeetSchema, mode),
      limitedUse: bonusLimitedUse(mode).optional(),
      available: z.boolean().optional(),
      ...entryProvenanceField,
    })
    .superRefine((action, ctx) => {
      const row = action as { distanceFeet?: number; movementFeet?: number }
      const distance = row.distanceFeet
      const movement = row.movementFeet
      if (typeof distance !== 'number' || typeof movement !== 'number') return
      if (!Number.isInteger(distance) || !Number.isInteger(movement)) return
      if (distance > movement) return
      addCustomRefinementIssue(ctx, LEAP_DISTANCE_EXCEEDS_MOVEMENT_MESSAGE, ['distanceFeet'])
    })
}

function teleportSchema<M extends MonsterActionMode>(mode: M) {
  return z
    .object({
      id: z.string().min(1),
      kind: z.literal('teleport'),
      name: strict(z.string().min(1), mode),
      distanceFeet: strict(positiveWholeFeetSchema, mode),
      /** Absent when Include another creature is closed. */
      passenger: bonusTeleportPassengerSchema.optional(),
      limitedUse: bonusLimitedUse(mode).optional(),
      available: z.boolean().optional(),
      ...entryProvenanceField,
    })
    .superRefine((action, ctx) => {
      if (mode === 'draft' || !action.passenger) return
      if (!action.passenger.withinFeet) {
        addCustomRefinementIssue(ctx, 'Within is required.', ['passenger', 'withinFeet'])
      }
      refineRequirementsForTargetKind('creature', action.passenger.requirements, ctx, [
        'passenger',
        'requirements',
      ])
    })
}

function takeActionsSchema<M extends MonsterActionMode>(mode: M) {
  const standardActions =
    mode === 'draft'
      ? z.array(z.enum(BONUS_STANDARD_ACTION_IDS)).default([])
      : z.array(z.enum(BONUS_STANDARD_ACTION_IDS)).min(1)
  return z
    .object({
      id: z.string().min(1),
      kind: z.literal('take-actions'),
      name: strict(z.string().min(1), mode),
      standardActions,
      /** Absent when fewer than two actions are selected. */
      combination: z.enum(BONUS_ACTION_COMBINATIONS).optional(),
      restriction: z.string().optional(),
      limitedUse: bonusLimitedUse(mode).optional(),
      available: z.boolean().optional(),
      ...entryProvenanceField,
    })
    .superRefine((action, ctx) => {
      if (mode === 'draft') return
      if (action.standardActions.length >= 2 && !action.combination) {
        addCustomRefinementIssue(ctx, 'Choose how these actions combine.', ['combination'])
      }
    })
}

export const monsterBonusActionSchema = z.discriminatedUnion('kind', [
  ...omitActionKinds(publishedActionFields, omittedSectionKinds('bonusActions')),
  leapSchema('published'),
  teleportSchema('published'),
  takeActionsSchema('published'),
])

export const monsterBonusActionDraftSchema = z.discriminatedUnion('kind', [
  ...omitActionKinds(draftActionFields, omittedSectionKinds('bonusActions')),
  leapSchema('draft'),
  teleportSchema('draft'),
  takeActionsSchema('draft'),
])

export type MonsterBonusAction = z.infer<typeof monsterBonusActionSchema>
export type MonsterBonusActionDraft = z.infer<typeof monsterBonusActionDraftSchema>
