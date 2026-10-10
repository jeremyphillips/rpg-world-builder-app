'use client'

import * as React from 'react'

import { resolveFieldErrorMessage } from '../errors/resolve-field-error-message'
import {
  isFieldPathEligibleForPresentation,
  issueMatchesFieldPath,
  shouldShowFieldErrorPresentation,
} from '../errors/resolve-field-error-presentation.lib'
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

export type FieldValidationPresentationState = Pick<
  ReturnType<typeof useFormValidationPresentation>,
  | 'issues'
  | 'hasAttemptedSubmit'
  | 'hasAttemptedPublish'
  | 'publishPresentationEnabled'
  | 'validationPresentation'
  | 'inactivePaths'
  | 'touchedPaths'
>

export function resolvePresentedFieldError(
  message: unknown,
  fieldPath: string | undefined,
  presentation: FieldValidationPresentationState,
): Pick<FieldErrorPresentation, 'error' | 'invalid'> & { hasError: boolean } {
  const resolvedError = resolveFieldErrorMessage(typeof message === 'string' ? message : undefined)
  const publishMessage = resolvePublishIssueMessage(
    fieldPath,
    presentation.issues,
    presentation.publishPresentationEnabled,
    presentation.hasAttemptedPublish,
  )
  const underlyingMessage = resolvedError ?? publishMessage
  const session = {
    validationPresentation: presentation.validationPresentation,
    hasAttemptedSubmit: presentation.hasAttemptedSubmit,
    hasAttemptedPublish: presentation.hasAttemptedPublish,
    publishPresentationEnabled: presentation.publishPresentationEnabled,
  }
  const eligible =
    fieldPath === undefined ||
    isFieldPathEligibleForPresentation(fieldPath, presentation.inactivePaths)
  const hasUnderlyingIssue =
    Boolean(underlyingMessage) ||
    (fieldPath !== undefined &&
      presentation.issues.some((issue) => issueMatchesFieldPath(issue, fieldPath)))
  const hasError = hasUnderlyingIssue && eligible
  const showMessage =
    fieldPath !== undefined
      ? shouldShowFieldErrorPresentation(
          fieldPath,
          session,
          presentation.inactivePaths,
          presentation.touchedPaths,
        )
      : Boolean(underlyingMessage)
  const visibleError = showMessage ? underlyingMessage : undefined

  return {
    error: visibleError,
    invalid: visibleError ? true : undefined,
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
  const { error, invalid, hasError } = resolvePresentedFieldError(message, fieldPath, presentation)

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
  fieldPath: string | undefined,
  ...messages: Array<unknown>
): FieldErrorPresentation {
  const { suppressFieldErrorText, rowSummaryId } = React.useContext(ArrayItemPresentationContext)
  const presentation = useFormValidationPresentation()
  const resolvedMessages = messages
    .map((message) => resolveFieldErrorMessage(typeof message === 'string' ? message : undefined))
    .filter((message): message is string => Boolean(message))
  const { error, invalid, hasError } = resolvePresentedFieldError(
    resolvedMessages[0],
    fieldPath,
    presentation,
  )

  return {
    error: suppressFieldErrorText ? undefined : error,
    invalid,
    describedBy: suppressFieldErrorText && hasError ? rowSummaryId : undefined,
  }
}
