import { deriveDefaultEffectRecipient, type EffectTargetCompatibilityContext } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  findResolutionEffectById,
  formatEffectReferenceDescription,
  formatEffectReferenceTitle,
  resolveEffectReferenceById,
  type EffectReferenceState,
  type ResolveEffectReferenceOptions,
} from './resolution-effect-reference.lib'
import { amountOptionsForEffect } from './resolution-outcome-applications-form-fields'
import type { ResolutionEffectFormItem } from './resolution-form-schema'

export type OutcomeApplicationRowPresentation = {
  reference: EffectReferenceState
  amountOptions: FieldOption[]
  singleAmountOption: FieldOption | undefined
  showAmountControl: boolean
  amountEnabled: boolean
  rowAriaLabel: string
  statusDescription: string | undefined
}

function resolveOptionsForRow(
  index: number,
  selectionContext?: EffectTargetCompatibilityContext,
): ResolveEffectReferenceOptions {
  if (!selectionContext) {
    return { index }
  }

  return {
    index,
    selectionContext,
    recipient: deriveDefaultEffectRecipient(selectionContext),
  }
}

export function buildOutcomeApplicationRowPresentation(
  effects: readonly ResolutionEffectFormItem[],
  application: { effectId?: string },
  index: number,
  selectionContext?: EffectTargetCompatibilityContext,
): OutcomeApplicationRowPresentation {
  const resolveOptions = resolveOptionsForRow(index, selectionContext)
  const reference = resolveEffectReferenceById(effects, application.effectId ?? '', resolveOptions)
  const effect = findResolutionEffectById(effects, application.effectId ?? '')
  const amountOptions = amountOptionsForEffect(effect)
  const singleAmountOption = amountOptions.length === 1 ? amountOptions[0] : undefined

  return {
    reference,
    amountOptions,
    singleAmountOption,
    showAmountControl: reference.kind !== 'missing',
    amountEnabled: reference.kind === 'resolved',
    rowAriaLabel: formatEffectReferenceTitle(reference, resolveOptions),
    statusDescription:
      reference.kind === 'incomplete' || reference.kind === 'unavailable'
        ? formatEffectReferenceDescription(reference)
        : undefined,
  }
}

export function buildOutcomeApplicationDescribedByIds(
  statusDescription: string | undefined,
  rowSummaryId: string,
  hasCompactIssueSummary: boolean,
): string | undefined {
  const ids = [
    statusDescription ? rowSummaryId : undefined,
    hasCompactIssueSummary ? rowSummaryId : undefined,
  ].filter(Boolean)

  return ids.length > 0 ? ids.join(' ') : undefined
}
