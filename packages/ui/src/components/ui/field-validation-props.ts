/** Shared validation presentation props for field wrappers. */
export interface FieldValidationProps {
  error?: string
  /** Drives invalid chrome when visible error text is suppressed. */
  invalid?: boolean
  /** Overrides auto-computed `aria-describedby` on the control. */
  describedBy?: string
}

export function fieldHasValidationError(
  error: string | undefined,
  invalid: boolean | undefined,
): boolean {
  return Boolean(invalid ?? error)
}

export function resolveFieldDescribedBy(
  error: string | undefined,
  invalid: boolean | undefined,
  hint: string | undefined,
  describedBy: string | undefined,
  errorId: string,
  hintId: string,
): string | undefined {
  if (describedBy) return describedBy
  const hasError = fieldHasValidationError(error, invalid)
  if (hasError) return errorId
  if (hint) return hintId
  return undefined
}
