import type { FieldOption } from '@rpg/ui/form'

import {
  findResolutionEffectById,
  formatEffectReferenceDescription,
  formatEffectReferenceTitle,
  resolveEffectReferenceById,
  type EffectReferenceState,
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

export function buildOutcomeApplicationRowPresentation(
  effects: readonly ResolutionEffectFormItem[],
  application: { effectId?: string },
  index: number,
): OutcomeApplicationRowPresentation {
  const reference = resolveEffectReferenceById(effects, application.effectId ?? '', { index })
  const effect = findResolutionEffectById(effects, application.effectId ?? '')
  const amountOptions = amountOptionsForEffect(effect)
  const singleAmountOption = amountOptions.length === 1 ? amountOptions[0] : undefined

  return {
    reference,
    amountOptions,
    singleAmountOption,
    showAmountControl: reference.kind !== 'missing',
    amountEnabled: reference.kind === 'resolved',
    rowAriaLabel: formatEffectReferenceTitle(reference, { index }),
    statusDescription:
      reference.kind === 'incomplete' ? formatEffectReferenceDescription(reference) : undefined,
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
