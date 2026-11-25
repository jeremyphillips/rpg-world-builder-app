'use client'

import { useFormValidationPresentation, type FormItem } from '@rpg/ui/form'

/**
 * Adopted content surfaces read validation through {@link useFormValidationPresentation}
 * instead of merging raw RHF trees alongside the UI presentation snapshot.
 */
export function useContentFormPresentationIssues(fieldsOverride?: FormItem[]) {
  return useFormValidationPresentation(fieldsOverride)
}
