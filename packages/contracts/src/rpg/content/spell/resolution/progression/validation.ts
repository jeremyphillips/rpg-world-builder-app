import type { z } from 'zod'
import { addCustomRefinementIssue } from '../../../../../lib/add-custom-refinement-issue'

import {
  DEFAULT_CANTrip_SCALING_THRESHOLDS,
  type CantripScalingThreshold,
} from '../../../../vocab/mechanics/cantrip-scaling-thresholds'
import type { SpellResolutionValidationInput } from '../schema'
import {
  findResolutionEffectById,
  isRollBearingResolutionEffect,
  progressionValueKindForProperty,
  readProgressionBaseValue,
} from './references'
import type {
  SpellResolutionProgression,
  SpellResolutionProgressionReference,
  SpellResolutionProgressionTrack,
} from './schema'
import { isValidSpellResolutionProgressionReferencePair } from './schema'
import { spellResolutionProgressionValidationMessages } from './validation-messages'

export type SpellResolutionProgressionValidationOptions = {
  spellLevel?: number
  cantripThresholds?: readonly CantripScalingThreshold[]
}

type ProgressionValidationContext = {
  resolution: SpellResolutionValidationInput
  progression: SpellResolutionProgression
  ctx: z.RefinementCtx
  pathPrefix: readonly ['progression']
  cantripThresholds: readonly CantripScalingThreshold[]
}

function isStrictlyAscending(values: readonly number[]): boolean {
  for (let index = 1; index < values.length; index++) {
    if (values[index]! <= values[index - 1]!) return false
  }
  return true
}

function isPositiveIncrementValue(
  track: Extract<SpellResolutionProgressionTrack, { kind: 'linear' }>,
): boolean {
  const { increment } = track
  if (increment.kind === 'count') return increment.count >= 1

  if (increment.roll.dice && increment.roll.dice.count >= 1) return true
  if (increment.roll.flat !== undefined && increment.roll.flat > 0) return true
  return false
}

function validateIncrementDiceFacesMatchBase(
  resolution: SpellResolutionValidationInput,
  track: Extract<SpellResolutionProgressionTrack, { kind: 'linear' }>,
): boolean {
  const base = readProgressionBaseValue(resolution, track.reference)
  if (!base || base.kind !== 'roll' || track.increment.kind !== 'roll') return true

  const baseFaces = base.roll.dice?.faces
  const incrementDice = track.increment.roll.dice
  if (!baseFaces || !incrementDice) return true

  return incrementDice.faces === baseFaces
}

function validateValueKindForReference(
  track: SpellResolutionProgressionTrack,
  valueKind: 'roll' | 'count',
): boolean {
  const values =
    track.kind === 'thresholds' ? track.entries.map((entry) => entry.value) : [track.increment]

  return values.every((value) => value.kind === valueKind)
}

function validateProgressionBasis(
  validation: ProgressionValidationContext,
  options: SpellResolutionProgressionValidationOptions,
): void {
  const { progression, ctx, pathPrefix } = validation
  if (progression.tracks.length === 0) {
    addCustomRefinementIssue(ctx, spellResolutionProgressionValidationMessages.tracksRequired(), [
      ...pathPrefix,
      'tracks',
    ])
  }

  if (options.spellLevel === undefined) return

  if (progression.basis === 'character-level' && options.spellLevel !== 0) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.basisRequiresCantripLevel(),
      [...pathPrefix, 'basis'],
    )
  }

  if (progression.basis === 'spell-slot-level' && options.spellLevel < 1) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.basisRequiresLeveledSpell(),
      [...pathPrefix, 'basis'],
    )
  }
}

function validateEffectReference(
  resolution: SpellResolutionValidationInput,
  reference: Extract<SpellResolutionProgressionReference['subject'], { kind: 'effect' }>,
  trackPath: readonly (string | number)[],
  ctx: z.RefinementCtx,
): void {
  const effect = findResolutionEffectById(resolution, reference.effectId)
  if (!effect) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.unknownEffectReference({
        effectId: reference.effectId,
      }),
      [...trackPath, 'reference', 'subject', 'effectId'],
    )
    return
  }

  if (!isRollBearingResolutionEffect(effect)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.effectMustBeRollBearing({
        effectId: reference.effectId,
      }),
      [...trackPath, 'reference', 'subject', 'effectId'],
    )
  }
}

function validateReferenceContext(
  resolution: SpellResolutionValidationInput,
  reference: SpellResolutionProgressionReference,
  track: SpellResolutionProgressionTrack,
  trackPath: readonly (string | number)[],
  ctx: z.RefinementCtx,
): void {
  if (reference.subject.kind === 'effect') {
    validateEffectReference(resolution, reference.subject, trackPath, ctx)
  }

  if (
    reference.property === 'projectile-count' &&
    resolution.applicationPattern?.kind !== 'projectiles'
  ) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.applicationPatternProjectilesRequired(),
      [...trackPath, 'reference'],
    )
  }

  if (reference.property === 'selected-target-count' && !resolution.target) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.targetRequiredForTargetCount(),
      [...trackPath, 'reference'],
    )
  }

  if (readProgressionBaseValue(resolution, track.reference) === undefined) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.invalidSubjectPropertyPair({
        subject: reference.subject.kind,
        property: reference.property,
      }),
      [...trackPath, 'reference'],
    )
  }
}

function validateThresholdTrack(
  track: Extract<SpellResolutionProgressionTrack, { kind: 'thresholds' }>,
  basis: SpellResolutionProgression['basis'],
  cantripThresholds: readonly CantripScalingThreshold[],
  trackPath: readonly (string | number)[],
  ctx: z.RefinementCtx,
): void {
  const thresholds = track.entries.map((entry) => entry.threshold)
  if (!isStrictlyAscending(thresholds)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.thresholdsMustAscend(),
      [...trackPath, 'entries'],
    )
  }

  if (basis !== 'character-level') return

  const expected = [...cantripThresholds]
  const actual = [...thresholds].sort((a, b) => a - b)
  const matches =
    actual.length === expected.length && actual.every((value, index) => value === expected[index])

  if (!matches) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.cantripThresholdsMustMatchRuleset({
        expected: expected.join(', '),
      }),
      [...trackPath, 'entries'],
    )
  }
}

function validateLinearTrack(
  resolution: SpellResolutionValidationInput,
  track: Extract<SpellResolutionProgressionTrack, { kind: 'linear' }>,
  trackPath: readonly (string | number)[],
  ctx: z.RefinementCtx,
): void {
  if (!isPositiveIncrementValue(track)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.incrementMustBePositive(),
      [...trackPath, 'increment'],
    )
  }

  if (
    track.increment.kind === 'roll' &&
    track.increment.roll.dice === undefined &&
    track.increment.roll.flat !== undefined
  ) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.flatOnlyIncrementNotSupported(),
      [...trackPath, 'increment'],
    )
  }

  if (!validateIncrementDiceFacesMatchBase(resolution, track)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.incrementDiceFacesMustMatchBase(),
      [...trackPath, 'increment'],
    )
  }
}

function validateProgressionTrack(
  validation: ProgressionValidationContext,
  track: SpellResolutionProgressionTrack,
  trackIndex: number,
): void {
  const { resolution, progression, ctx, pathPrefix } = validation
  const trackPath = [...pathPrefix, 'tracks', trackIndex] as const
  const { reference } = track

  if (!isValidSpellResolutionProgressionReferencePair(reference.subject, reference.property)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.invalidSubjectPropertyPair({
        subject: reference.subject.kind,
        property: reference.property,
      }),
      [...trackPath, 'reference'],
    )
    return
  }

  const expectedValueKind = progressionValueKindForProperty(reference.property)
  if (!validateValueKindForReference(track, expectedValueKind)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionProgressionValidationMessages.valueKindMismatch({
        expected: expectedValueKind,
        actual: track.kind === 'linear' ? track.increment.kind : 'mixed',
      }),
      [...trackPath],
    )
  }

  validateReferenceContext(resolution, reference, track, trackPath, ctx)

  if (track.kind === 'thresholds') {
    validateThresholdTrack(track, progression.basis, validation.cantripThresholds, trackPath, ctx)
  }

  if (track.kind === 'linear') {
    validateLinearTrack(resolution, track, trackPath, ctx)
  }
}

export function validateSpellResolutionProgression(
  resolution: SpellResolutionValidationInput,
  progression: SpellResolutionProgression,
  ctx: z.RefinementCtx,
  options: SpellResolutionProgressionValidationOptions = {},
): void {
  const validation: ProgressionValidationContext = {
    resolution,
    progression,
    ctx,
    pathPrefix: ['progression'],
    cantripThresholds: options.cantripThresholds ?? DEFAULT_CANTrip_SCALING_THRESHOLDS,
  }

  validateProgressionBasis(validation, options)
  progression.tracks.forEach((track, trackIndex) => {
    validateProgressionTrack(validation, track, trackIndex)
  })
}
