'use client'

import { useFormValidationPresentation, type FormItem } from '@rpg/ui/form'

/**
 * Adopted content surfaces read producer slots through {@link useFormValidationPresentation}
 * when {@link FormValidationProducerProvider} is mounted (content submit ProducerBoundary).
 */
export function useContentFormPresentationIssues(fieldsOverride?: FormItem[]) {
  return useFormValidationPresentation(fieldsOverride)
}
