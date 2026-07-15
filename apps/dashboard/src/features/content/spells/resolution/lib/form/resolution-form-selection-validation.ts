import type { z } from 'zod'

import { resolutionFormValidationMessages } from './resolution-form-messages'
import type { ResolutionFormValues } from './resolution-form-schema'
import { validateResolutionFormOutcomes } from './resolution-form-outcome-validation'

function validateResolutionFormMethodFields(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.methodKind === 'attack' && !values.attackType) {
    ctx.addIssue({
      code: 'custom',
      message: resolutionFormValidationMessages.attackTypeRequired(),
      path: ['attackType'],
    })
  }

  if (values.methodKind === 'saving-throw' && !values.saveAbility) {
    ctx.addIssue({
      code: 'custom',
      message: resolutionFormValidationMessages.saveAbilityRequired(),
      path: ['saveAbility'],
    })
  }
}

function validateResolutionFormTargetProximity(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.selectionMode !== 'targets' || values.proximityKind !== 'distance') return
  if (values.proximityDistanceFt !== undefined) return

  ctx.addIssue({
    code: 'custom',
    message: resolutionFormValidationMessages.proximityDistanceRequired(),
    path: ['proximityDistanceFt'],
  })
}

function validateResolutionFormPointOrigin(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.selectionMode !== 'point' || values.originDistanceFt !== undefined) return

  ctx.addIssue({
    code: 'custom',
    message: resolutionFormValidationMessages.originDistanceRequired(),
    path: ['originDistanceFt'],
  })
}

function validateResolutionFormProjectileCount(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.applicationPatternKind !== 'projectiles' || values.projectileCount !== undefined) {
    return
  }

  ctx.addIssue({
    code: 'custom',
    message: resolutionFormValidationMessages.projectileCountRequired(),
    path: ['projectileCount'],
  })
}

export function validateResolutionFormSelection(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  validateResolutionFormMethodFields(values, ctx)
  validateResolutionFormTargetProximity(values, ctx)
  validateResolutionFormPointOrigin(values, ctx)
  validateResolutionFormProjectileCount(values, ctx)
  validateResolutionFormOutcomes(values, ctx)
}
