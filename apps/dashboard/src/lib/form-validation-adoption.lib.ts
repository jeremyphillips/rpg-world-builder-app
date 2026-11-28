import { getErrorMessage } from '@rpg/contracts'
import { useCallback, useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { applyApiErrorValidationToCanonicalRhf } from '@/features/content/lib/forms/validation/ingest-content-form-validation.lib'

/** Tabbed/flat adopted forms: structured API issues paint on RHF; everything else becomes footer copy. */
export function useAdoptedFormSubmit<TValues extends FieldValues>(
  submit: (values: TValues, form: UseFormReturn<TValues>) => Promise<void>,
  fallbackMessage: string,
  mapFooterError?: (error: unknown) => string | undefined,
) {
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = useCallback(
    async (values: TValues, form: UseFormReturn<TValues>) => {
      setFormError(null)
      try {
        await submit(values, form)
      } catch (error) {
        if (!applyApiErrorValidationToCanonicalRhf(form, error)) {
          setFormError(mapFooterError?.(error) ?? getErrorMessage(error, fallbackMessage))
        }
      }
    },
    [fallbackMessage, mapFooterError, submit],
  )

  return { onSubmit, formError }
}
