import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { FormIssue } from '@rpg/ui/form'

import {
  formIssuesToPathMessages,
  paintValidationIssuesOnForm,
} from './content-publish-validation.lib'

/** Clears RHF chrome and paints canonical {@link FormIssue} paths for adopted content forms. */
export function applyCanonicalFormIssuesToRhf<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly FormIssue[],
): void {
  form.clearErrors()
  paintValidationIssuesOnForm(form, formIssuesToPathMessages(issues))
}
