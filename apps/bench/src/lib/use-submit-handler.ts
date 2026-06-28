import { useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

function toFormError(error: unknown, fallback: string): string | undefined {
  if (!error) return undefined
  return error instanceof Error ? error.message : fallback
}

export type FormSubmitHandler<TValues extends FieldValues> = (
  values: TValues,
  form: UseFormReturn<TValues>,
) => Promise<void>

export interface UseSubmitHandlerResult<TValues extends FieldValues> {
  onSubmit: FormSubmitHandler<TValues>
  formError: string | undefined
}

/** Standard submit wrapper: maps thrown errors to a form-level error string. */
export function useSubmitHandler<TValues extends FieldValues>(
  submit: FormSubmitHandler<TValues>,
  fallbackMessage: string,
): UseSubmitHandlerResult<TValues> {
  const [error, setError] = useState<unknown>(null)

  async function onSubmit(values: TValues, form: UseFormReturn<TValues>) {
    setError(null)
    try {
      await submit(values, form)
    } catch (err) {
      setError(err)
    }
  }

  return { onSubmit, formError: toFormError(error, fallbackMessage) }
}
