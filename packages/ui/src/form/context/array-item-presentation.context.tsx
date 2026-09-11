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
  _isHorizontalRow: boolean,
): boolean {
  if (errorPlacement === 'field') return false
  if (errorPlacement === 'row') return true
  return variant === 'compact'
}

export interface FieldErrorPresentation {
  error: string | undefined
  invalid: boolean | undefined
  describedBy: string | undefined
}

function resolvePublishIssueMessage(
  fieldPath: string | undefined,
  issues: ReturnType<typeof useFormValidationPresentation>['issues'],
  publishPresentationEnabled: boolean,
  hasAttemptedPublish: boolean,
): string | undefined {
  if (!publishPresentationEnabled || !hasAttemptedPublish || !fieldPath) return undefined
  return resolveFieldErrorMessage(issues.find((issue) => issue.path === fieldPath)?.message)
}

function fieldHasPresentationIssue(
  fieldPath: string | undefined,
  issues: ReturnType<typeof useFormValidationPresentation>['issues'],
  presentationActive: boolean,
): boolean {
  return Boolean(
    fieldPath && presentationActive && issues.some((issue) => issue.path === fieldPath),
  )
}

function resolvePresentedFieldError(
  message: unknown,
  fieldPath: string | undefined,
  issues: ReturnType<typeof useFormValidationPresentation>['issues'],
  presentation: Pick<
    ReturnType<typeof useFormValidationPresentation>,
    'hasAttemptedSubmit' | 'hasAttemptedPublish' | 'publishPresentationEnabled'
  >,
): Pick<FieldErrorPresentation, 'error' | 'invalid'> & { hasError: boolean } {
  const resolvedError = resolveFieldErrorMessage(typeof message === 'string' ? message : undefined)
  const presentationActive =
    (presentation.publishPresentationEnabled && presentation.hasAttemptedPublish) ||
    presentation.hasAttemptedSubmit
  const visibleError =
    resolvedError ??
    resolvePublishIssueMessage(
      fieldPath,
      issues,
      presentation.publishPresentationEnabled,
      presentation.hasAttemptedPublish,
    )
  const hasError =
    Boolean(visibleError) || fieldHasPresentationIssue(fieldPath, issues, presentationActive)

  return {
    error: visibleError,
    invalid: hasError || undefined,
    hasError,
  }
}

/** Maps a raw RHF error message to visible/suppressed field presentation props. */
export function useFieldErrorPresentation(
  message: unknown,
  fieldPath?: string,
): FieldErrorPresentation {
  const { suppressFieldErrorText, rowSummaryId } = React.useContext(ArrayItemPresentationContext)
  const presentation = useFormValidationPresentation()
  const { error, invalid, hasError } = resolvePresentedFieldError(
    message,
    fieldPath,
    presentation.issues,
    presentation,
  )

  return {
    error: suppressFieldErrorText ? undefined : error,
    invalid,
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
