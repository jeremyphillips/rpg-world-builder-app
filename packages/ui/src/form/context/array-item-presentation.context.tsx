'use client'

import * as React from 'react'

import { resolveFieldErrorMessage } from '../errors/resolve-field-error-message'
import { useFormValidationPresentation } from '../hooks/use-form-validation-presentation.client'

export type ErrorPlacement = 'auto' | 'field' | 'row'

export interface ArrayItemPresentationContextValue {
  /** When true, StandardFieldRenderer passes error=undefined and invalid=true */
  suppressFieldErrorText: boolean
  /** Stable id of the row summary element for aria-describedby wiring */
  rowSummaryId: string | undefined
}

export const ArrayItemPresentationContext = React.createContext<ArrayItemPresentationContextValue>({
  suppressFieldErrorText: false,
  rowSummaryId: undefined,
})

/** Whether per-field error text should be suppressed for the current layout. */
export function resolveErrorPlacement(
  errorPlacement: ErrorPlacement | undefined,
  variant: 'compact' | 'detailed',
  isHorizontalRow: boolean,
): boolean {
  if (errorPlacement === 'field') return false
  if (errorPlacement === 'row') return true
  return variant === 'compact' || isHorizontalRow
}

export interface FieldErrorPresentation {
  error: string | undefined
  invalid: boolean | undefined
  describedBy: string | undefined
}

/** Maps a raw RHF error message to visible/suppressed field presentation props. */
export function useFieldErrorPresentation(
  message: unknown,
  fieldPath?: string,
): FieldErrorPresentation {
  const { suppressFieldErrorText, rowSummaryId } = React.useContext(ArrayItemPresentationContext)
  const { issues, hasAttemptedSubmit } = useFormValidationPresentation()
  const resolvedError = resolveFieldErrorMessage(typeof message === 'string' ? message : undefined)
  const hasIndexedIssue = Boolean(
    fieldPath && hasAttemptedSubmit && issues.some((issue) => issue.path === fieldPath),
  )
  const hasError = Boolean(resolvedError) || hasIndexedIssue

  return {
    error: suppressFieldErrorText ? undefined : resolvedError,
    invalid: hasError || undefined,
    describedBy: suppressFieldErrorText && hasError ? rowSummaryId : undefined,
  }
}

/** Combines multiple field errors with suppression semantics. */
export function useCombinedFieldErrorPresentation(
  ...messages: Array<unknown>
): FieldErrorPresentation {
  const { suppressFieldErrorText, rowSummaryId } = React.useContext(ArrayItemPresentationContext)
  const resolvedMessages = messages
    .map((message) => resolveFieldErrorMessage(typeof message === 'string' ? message : undefined))
    .filter((message): message is string => Boolean(message))
  const hasError = resolvedMessages.length > 0
  const resolvedError = resolvedMessages[0]

  return {
    error: suppressFieldErrorText ? undefined : resolvedError,
    invalid: hasError || undefined,
    describedBy: suppressFieldErrorText && hasError ? rowSummaryId : undefined,
  }
}
