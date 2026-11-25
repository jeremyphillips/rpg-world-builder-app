import type { ApiValidationIssue } from '@rpg/contracts'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import type { FormIssue } from '@rpg/ui/form'

import { formIssuesToPathMessages } from './content-publish-validation.lib'

function paintPathValidationMessagesOnForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly Pick<ApiValidationIssue, 'path' | 'message'>[],
): void {
  for (const issue of issues) {
    if (!issue.path) continue
    const path = issue.path as FieldPath<TFieldValues>
    form.setError(path, {
      type: 'server',
      message: issue.message,
    })
    const current = form.getValues(path)
    if (current !== undefined) {
      form.setValue(path, current, { shouldTouch: true, shouldValidate: false })
    }
  }
}

/** Clears RHF chrome and paints canonical {@link FormIssue} paths for adopted content forms. */
export function applyCanonicalFormIssuesToRhf<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly FormIssue[],
): void {
  form.clearErrors()
  paintPathValidationMessagesOnForm(form, formIssuesToPathMessages(issues))
}
