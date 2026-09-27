import {
  addCustomRefinementIssue,
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  supportsPartialApplicationForEffectKind,
  type SpellResolutionOutcomeResult,
} from '@rpg/contracts'
import type { z } from 'zod'

import { findResolutionEffectById } from './resolution-outcome-display.lib'
import { resolutionMethodFromForm } from './resolution-outcome-slots.lib'
import { resolutionFormValidationMessages } from './resolution-form-messages'
import type { ResolutionFormValues } from './resolution-form-schema'

export function validateResolutionFormOutcomes(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  const method = resolutionMethodFromForm(values)
  if (!method || !values.outcomes?.length) return

  const allowedResults = new Set(getOutcomeResultsForMethod(method))
  const seenResults = new Set<SpellResolutionOutcomeResult>()

  values.outcomes.forEach((outcome, outcomeIndex) => {
    validateResolutionFormOutcomeResult(outcome, outcomeIndex, allowedResults, seenResults, ctx)
    validateResolutionFormOutcomeApplications(values, outcome, outcomeIndex, ctx)
  })

  if (!values.outcomes.some(hasMeaningfulOutcomeContent)) {
    addCustomRefinementIssue(
      ctx,
      resolutionFormValidationMessages.resolutionRequiresMeaningfulOutcome(),
      ['outcomes'],
    )
  }
}

function validateResolutionFormOutcomeResult(
  outcome: NonNullable<ResolutionFormValues['outcomes']>[number],
  outcomeIndex: number,
  allowedResults: Set<SpellResolutionOutcomeResult>,
  seenResults: Set<SpellResolutionOutcomeResult>,
  ctx: z.RefinementCtx,
): void {
  if (seenResults.has(outcome.result)) {
    addCustomRefinementIssue(ctx, resolutionFormValidationMessages.duplicateOutcomeResult(), [
      'outcomes',
      outcomeIndex,
      'result',
    ])
  }
  seenResults.add(outcome.result)

  if (!allowedResults.has(outcome.result)) {
    addCustomRefinementIssue(
      ctx,
      resolutionFormValidationMessages.outcomeResultNotAllowedForMethod({
        result: outcome.result,
      }),
      ['outcomes', outcomeIndex, 'result'],
    )
  }
}

function validateResolutionFormOutcomeApplications(
  values: ResolutionFormValues,
  outcome: NonNullable<ResolutionFormValues['outcomes']>[number],
  outcomeIndex: number,
  ctx: z.RefinementCtx,
): void {
  const applicationEffectIds = outcome.applications.map((application) => application.effectId)
  const uniqueApplicationEffectIds = new Set(applicationEffectIds)
  if (uniqueApplicationEffectIds.size !== applicationEffectIds.length) {
    addCustomRefinementIssue(
      ctx,
      resolutionFormValidationMessages.duplicateOutcomeApplicationEffectId(),
      ['outcomes', outcomeIndex, 'applications'],
    )
  }

  outcome.applications.forEach((application, applicationIndex) => {
    const effect = findResolutionEffectById(values.effects, application.effectId)
    if (!effect) {
      addCustomRefinementIssue(
        ctx,
        resolutionFormValidationMessages.unknownEffectReference({
          effectId: application.effectId,
        }),
        ['outcomes', outcomeIndex, 'applications', applicationIndex, 'effectId'],
      )
      return
    }

    if (application.amount === 'half' && !supportsPartialApplicationForEffectKind(effect.kind)) {
      addCustomRefinementIssue(
        ctx,
        resolutionFormValidationMessages.halfNotSupportedForEffectKind({
          kind: effect.kind,
        }),
        ['outcomes', outcomeIndex, 'applications', applicationIndex, 'amount'],
      )
    }
  })
}
