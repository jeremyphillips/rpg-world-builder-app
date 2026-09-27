import type { z } from 'zod'

import {
  addCustomRefinementIssue,
  getSelectionMethodCompatibility,
  getSelectionMethodCompatibilityReasonCode,
  resolveSelectionMethodContextKey,
  spellResolutionValidationMessages,
} from '@rpg/contracts'

import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'
import { resolutionFormValidationMessages } from './resolution-form-messages'
import type { ResolutionFormValues } from './resolution-form-schema'
import { validateResolutionFormOutcomes } from './resolution-form-outcome-validation'

function validateResolutionFormMethodFields(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.methodKind === 'attack' && !values.attackType) {
    addCustomRefinementIssue(ctx, resolutionFormValidationMessages.attackTypeRequired(), [
      'attackType',
    ])
  }

  if (values.methodKind === 'saving-throw' && !values.saveAbility) {
    addCustomRefinementIssue(ctx, resolutionFormValidationMessages.saveAbilityRequired(), [
      'saveAbility',
    ])
  }
}

function validateResolutionFormTargetProximity(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.selectionMode !== 'targets' || values.proximityKind !== 'distance') return
  if (values.proximityDistanceFt !== undefined) return

  addCustomRefinementIssue(ctx, resolutionFormValidationMessages.proximityDistanceRequired(), [
    'proximityDistanceFt',
  ])
}

function validateResolutionFormPointOrigin(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.selectionMode !== 'point' || values.originDistanceFt !== undefined) return

  addCustomRefinementIssue(ctx, resolutionFormValidationMessages.originDistanceRequired(), [
    'originDistanceFt',
  ])
}

function validateResolutionFormProjectileCount(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.applicationPatternKind !== 'projectiles' || values.projectileCount !== undefined) {
    return
  }

  addCustomRefinementIssue(ctx, resolutionFormValidationMessages.projectileCountRequired(), [
    'projectileCount',
  ])
}

function validateResolutionFormMethodSelectionCompatibility(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  const hasAreaOfEffect = Boolean(
    values.areaOfEffect?.shape && values.areaOfEffect.shape !== SPELL_AREA_GEOMETRY_NONE,
  )
  const context = resolveSelectionMethodContextKey({
    selectionMode: values.selectionMode,
    hasAreaOfEffect,
  })
  const compatibility = getSelectionMethodCompatibility(context, values.methodKind)
  if (compatibility === 'supported') return

  const reasonCode = getSelectionMethodCompatibilityReasonCode(context, values.methodKind)
  if (!reasonCode) return

  addCustomRefinementIssue(
    ctx,
    spellResolutionValidationMessages.methodIncompatibleWithSelectionMode({
      compatibility,
      reasonCode,
      methodKind: values.methodKind,
      selectionContext: context,
    }),
    ['methodKind'],
  )
}

export function validateResolutionFormSelection(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  validateResolutionFormMethodFields(values, ctx)
  validateResolutionFormMethodSelectionCompatibility(values, ctx)
  validateResolutionFormTargetProximity(values, ctx)
  validateResolutionFormPointOrigin(values, ctx)
  validateResolutionFormProjectileCount(values, ctx)
  validateResolutionFormOutcomes(values, ctx)
}
