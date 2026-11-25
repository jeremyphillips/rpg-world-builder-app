import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  replaceFormValidationProducerSlot,
  type FormIssue,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { paintValidationIssuesOnForm } from './content-publish-validation.lib'

export function ingestContentFormValidationIssues(
  session: FormValidationProducerSession,
  slot: FormValidationProducerSlot,
  stamp: number,
  issues: readonly FormIssue[],
): FormValidationProducerSession {
  return replaceFormValidationProducerSlot(session, slot, stamp, issues)
}

export function applyCanonicalFormIssuesToRhf<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly FormIssue[],
): void {
  form.clearErrors()
  paintValidationIssuesOnForm(
    form,
    issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  )
}
