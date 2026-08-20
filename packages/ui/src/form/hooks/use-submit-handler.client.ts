'use client'

import { useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

function toFormError(
  error: unknown,
  fallback: string,
  mapError?: (error: unknown) => string | undefined,
): string | undefined {
  if (!error) return undefined
  const mapped = mapError?.(error)
  if (mapped !== undefined) return mapped
  return error instanceof Error ? error.message : fallback
}

export type FormSubmitHandler<TValues extends FieldValues> = (
  values: TValues,
  form: UseFormReturn<TValues>,
) => Promise<void>

export interface UseSubmitHandlerOptions<TValues extends FieldValues> {
  submit: FormSubmitHandler<TValues>
  fallbackMessage: string
  mapError?: (error: unknown) => string | undefined
  /**
   * When true, swallowed submit failures resolve without rethrowing. Prefer leaving
   * this unset so callers can gate success chrome on a rejected submit Promise.
   */
  absorbErrors?: boolean
  /**
   * @deprecated Use default rejection behavior or `absorbErrors: true` when needed.
   */
  propagateErrors?: boolean
}

export interface UseSubmitHandlerResult<TValues extends FieldValues> {
  /** Pass to a `<Form>` / `<TabbedForm>` `onSubmit`. */
  onSubmit: FormSubmitHandler<TValues>
  /** Pass to the form's `formError` prop. */
  formError: string | undefined
}

/**
 * Generic form-error adapter: clears stale root errors, awaits the submit
 * callback (preserving RHF `isSubmitting`), maps thrown errors to `formError`,
 * and rethrows by default so submit failure is not mistaken for success.
 */
export function useSubmitHandler<TValues extends FieldValues>(
  options: UseSubmitHandlerOptions<TValues>,
): UseSubmitHandlerResult<TValues>
export function useSubmitHandler<TValues extends FieldValues>(
  submit: FormSubmitHandler<TValues>,
  fallbackMessage: string,
): UseSubmitHandlerResult<TValues>
export function useSubmitHandler<TValues extends FieldValues>(
  submitOrOptions: FormSubmitHandler<TValues> | UseSubmitHandlerOptions<TValues>,
  fallbackMessage?: string,
): UseSubmitHandlerResult<TValues> {
  const options =
    typeof submitOrOptions === 'function'
      ? { submit: submitOrOptions, fallbackMessage: fallbackMessage ?? 'Could not save.' }
      : submitOrOptions

  const [error, setError] = useState<unknown>(null)

  async function onSubmit(values: TValues, form: UseFormReturn<TValues>) {
    setError(null)
    try {
      await options.submit(values, form)
    } catch (err) {
      setError(err)
      const shouldAbsorb = options.absorbErrors === true
      if (!shouldAbsorb) {
        throw err
      }
    }
  }

  return {
    onSubmit,
    formError: toFormError(error, options.fallbackMessage, options.mapError),
  }
}
