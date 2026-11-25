import type { FormIssue } from '../errors/form-issue.types'
import type { FormValidationProducerSlot } from './form-evaluation.types'

export const FORM_VALIDATION_PRODUCER_SLOT_ORDER: readonly FormValidationProducerSlot[] = [
  'interactive',
  'draft-action',
  'publish-readiness',
  'publish-action',
  'serialization',
  'api',
] as const

export type FormValidationProducerSlotState = {
  slot: FormValidationProducerSlot
  stamp: number
  issues: FormIssue[]
}

export type FormValidationProducerSession = {
  slots: Partial<Record<FormValidationProducerSlot, FormValidationProducerSlotState>>
}

export function createEmptyFormValidationProducerSession(): FormValidationProducerSession {
  return { slots: {} }
}

export function issueDedupKey(issue: FormIssue): string {
  const owner = issue.claim?.target ?? issue.presentationPath ?? issue.path
  const messageId = issue.messageId ?? ''
  const params = issue.messageParams ? JSON.stringify(issue.messageParams) : ''
  const ruleId = issue.message
  return `${messageId}|${params}|${owner}|${ruleId}`
}

/** Drop duplicates when messageId, params, owner id, and rule copy all match. */
export function dedupeFormIssues(issues: readonly FormIssue[]): FormIssue[] {
  const seen = new Set<string>()
  const deduped: FormIssue[] = []
  for (const issue of issues) {
    const key = issueDedupKey(issue)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(issue)
  }
  return deduped
}

/**
 * Replace one producer slot, including with an empty success list. Other slots are unchanged.
 */
export function replaceFormValidationProducerSlot(
  session: FormValidationProducerSession,
  slot: FormValidationProducerSlot,
  stamp: number,
  issues: readonly FormIssue[],
): FormValidationProducerSession {
  return {
    slots: {
      ...session.slots,
      [slot]: {
        slot,
        stamp,
        issues: dedupeFormIssues(issues),
      },
    },
  }
}

export function readFormValidationProducerSlotIssues(
  session: FormValidationProducerSession,
  slot: FormValidationProducerSlot,
): readonly FormIssue[] {
  return session.slots[slot]?.issues ?? []
}

export function collectFormValidationSessionIssues(
  session: FormValidationProducerSession,
): FormIssue[] {
  const merged: FormIssue[] = []
  for (const slot of FORM_VALIDATION_PRODUCER_SLOT_ORDER) {
    const state = session.slots[slot]
    if (state) merged.push(...state.issues)
  }
  return dedupeFormIssues(merged)
}

export function isFormValidationProducerSlotStale(
  state: FormValidationProducerSlotState | undefined,
  currentStamp: number,
): boolean {
  if (!state) return false
  return state.stamp !== currentStamp
}
