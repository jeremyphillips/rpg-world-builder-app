import { getApiValidationIssues, type ApiValidationIssue } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  FORM_VALIDATION_PRODUCER_SLOT_ORDER,
  replaceFormValidationProducerSlot,
  type FormIssue,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { applyCanonicalFormIssuesToRhf } from './content-form-validation-rhf.lib'
import { apiValidationIssuesToFormIssues } from './normalize-content-form-issues.lib'

export { applyCanonicalFormIssuesToRhf } from './content-form-validation-rhf.lib'

export function applyApiValidationIssuesToCanonicalRhf<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  apiIssues: readonly Pick<ApiValidationIssue, 'path' | 'message'>[],
): void {
  applyCanonicalFormIssuesToRhf(form, apiValidationIssuesToFormIssues(apiIssues))
}

/** Paints structured API validation on RHF when `error` carries issue details. */
export function applyApiErrorValidationToCanonicalRhf<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
): FormIssue[] | null {
  const issues = getApiValidationIssues(error)
  if (!issues?.length) return null
  applyApiValidationIssuesToCanonicalRhf(form, issues)
  return apiValidationIssuesToFormIssues(issues)
}

export function ingestContentFormValidationIssues(
  session: FormValidationProducerSession,
  slot: FormValidationProducerSlot,
  stamp: number,
  issues: readonly FormIssue[],
): FormValidationProducerSession {
  return replaceFormValidationProducerSlot(session, slot, stamp, issues)
}

/** RHF canonical paint can advance the snapshot stamp after slot ingest on the same turn. */
export function realignFormValidationProducerSessionStamps(
  session: FormValidationProducerSession,
  currentStamp: number,
): FormValidationProducerSession {
  let next = session
  let changed = false
  for (const slot of FORM_VALIDATION_PRODUCER_SLOT_ORDER) {
    const state = next.slots[slot]
    if (state?.issues.length && state.stamp !== currentStamp) {
      next = ingestContentFormValidationIssues(next, slot, currentStamp, state.issues)
      changed = true
    }
  }
  return changed ? next : session
}
