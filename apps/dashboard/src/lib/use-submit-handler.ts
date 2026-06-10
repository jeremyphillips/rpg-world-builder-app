import { useState } from 'react'

/**
 * Derives a human-readable string from a submit error for display in a form's
 * `formError` prop. An `Error` instance surfaces its own message; any other
 * truthy value (e.g. an unknown thrown object) falls back to the supplied
 * fallback string.
 */
function toFormError(error: unknown, fallback: string): string | undefined {
  if (!error) return undefined
  return error instanceof Error ? error.message : fallback
}

export interface UseSubmitHandlerResult<TValues> {
  /** Pass to a `<Form>` / `<TabbedForm>` `onSubmit`. */
  onSubmit: (values: TValues) => Promise<void>
  /** Pass to the form's `formError` prop. */
  formError: string | undefined
}

/**
 * Standard submit wrapper for dashboard forms: clears the previous error,
 * awaits `submit` (uploads + `mutateAsync`), and maps anything thrown to a
 * `formError` string.
 *
 * ```tsx
 * const { onSubmit, formError } = useSubmitHandler<AccountFormValues>(
 *   async (values) => { await mutateAsync(buildInput(values)) },
 *   'Could not save profile.',
 * )
 * ```
 */
export function useSubmitHandler<TValues>(
  submit: (values: TValues) => Promise<void>,
  fallbackMessage: string,
): UseSubmitHandlerResult<TValues> {
  const [error, setError] = useState<unknown>(null)

  async function onSubmit(values: TValues) {
    setError(null)
    try {
      await submit(values)
    } catch (err) {
      setError(err)
    }
  }

  return { onSubmit, formError: toFormError(error, fallbackMessage) }
}
