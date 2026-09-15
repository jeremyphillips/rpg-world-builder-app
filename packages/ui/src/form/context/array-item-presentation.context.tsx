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
  _variant: 'compact' | 'detailed',
  _isHorizontalRow: boolean,
): boolean {
  if (errorPlacement === 'field') return false
  if (errorPlacement === 'row') return true
  return false
}

export interface FieldErrorPresentation {
  error: string | undefined
  invalid: boolean | undefined
  describedBy: string | undefined
}

function issueMatchesFieldPath(
  issue: { path: string; presentationPath?: string },
  fieldPath: string,
) {
  const presentationPath = issue.presentationPath ?? issue.path
  return presentationPath === fieldPath || issue.path === fieldPath
}

function resolvePublishIssueMessage(
  fieldPath: string | undefined,
  issues: ReturnType<typeof useFormValidationPresentation>['issues'],
  publishPresentationEnabled: boolean,
  hasAttemptedPublish: boolean,
): string | undefined {
  if (!publishPresentationEnabled || !hasAttemptedPublish || !fieldPath) return undefined
  const issue = issues.find((entry) => issueMatchesFieldPath(entry, fieldPath))
  return resolveFieldErrorMessage(issue?.message)
}

function fieldHasPresentationIssue(
  fieldPath: string | undefined,
  issues: ReturnType<typeof useFormValidationPresentation>['issues'],
  presentationActive: boolean,
): boolean {
  return Boolean(
    fieldPath &&
    presentationActive &&
    issues.some((issue) => issueMatchesFieldPath(issue, fieldPath)),
  )
}

export type FieldValidationPresentationState = Pick<
  ReturnType<typeof useFormValidationPresentation>,
  'issues' | 'hasAttemptedSubmit' | 'hasAttemptedPublish' | 'publishPresentationEnabled'
>

export function resolvePresentedFieldError(
  message: unknown,
  fieldPath: string | undefined,
  issues: FieldValidationPresentationState['issues'],
  presentation: Pick<
    FieldValidationPresentationState,
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

/** Maps a raw RHF / publish issue to field presentation props (no React hook). */
export function resolvePresentedFieldValidation(
  message: unknown,
  fieldPath: string | undefined,
  presentation: FieldValidationPresentationState,
  suppressFieldErrorText: boolean,
  rowSummaryId: string | undefined,
): FieldErrorPresentation {
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

/** Maps a raw RHF error message to visible/suppressed field presentation props. */
export function useFieldErrorPresentation(
  message: unknown,
  fieldPath?: string,
): FieldErrorPresentation {
  const { suppressFieldErrorText, rowSummaryId } = React.useContext(ArrayItemPresentationContext)
  const presentation = useFormValidationPresentation()

  return resolvePresentedFieldValidation(
    message,
    fieldPath,
    presentation,
    suppressFieldErrorText,
    rowSummaryId,
  )
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
