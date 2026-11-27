'use client'

import * as React from 'react'

import {
  resolveFieldIssueDisplayMessage,
  findRoutedIssueForFieldPath,
} from '../errors/resolve-field-issue.lib'
import {
  isFieldPathEligibleForPresentation,
  shouldShowFieldErrorPresentation,
} from '../errors/resolve-field-error-presentation.lib'
import { useFormValidationSessionProjection } from './use-form-validation-session-projection.client'

export type UseFieldIssueOptions = {
  /** Whether the control should show invalid chrome when an issue exists. */
  eligible?: boolean
}

export type FieldIssuePresentation = {
  message: string | undefined
  invalid: boolean | undefined
  hasIssue: boolean
}

function flattenTouchedPaths(
  touchedFields: unknown,
  prefix = '',
  touchedPaths: string[] = [],
): string[] {
  if (touchedFields === true) {
    if (prefix) touchedPaths.push(prefix)
    return touchedPaths
  }
  if (Array.isArray(touchedFields)) {
    touchedFields.forEach((entry, index) => {
      if (entry === undefined || entry === null) return
      flattenTouchedPaths(entry, `${prefix}.${index}`, touchedPaths)
    })
    return touchedPaths
  }
  if (typeof touchedFields !== 'object' || touchedFields === null) return touchedPaths
  for (const [key, value] of Object.entries(touchedFields)) {
    if (value === undefined || value === null) continue
    const nextPath = prefix ? `${prefix}.${key}` : key
    flattenTouchedPaths(value, nextPath, touchedPaths)
  }
  return touchedPaths
}

/** Routed validation state for one bound control path. */
export function useFieldIssue(
  fieldPath: string | undefined,
  options: UseFieldIssueOptions = {},
): FieldIssuePresentation {
  const presentation = useFormValidationSessionProjection()
  const touchedPaths = React.useMemo(
    () => flattenTouchedPaths(presentation.touchedFields),
    [presentation.touchedFields],
  )
  const eligible =
    options.eligible ??
    (fieldPath === undefined ||
      isFieldPathEligibleForPresentation(fieldPath, presentation.inactivePaths))

  const message = React.useMemo(() => {
    if (!fieldPath || !eligible) return undefined
    const decoded = resolveFieldIssueDisplayMessage(fieldPath, presentation.issues)
    if (!decoded) return undefined

    const session = {
      validationPresentation: presentation.validationPresentation,
      hasAttemptedSubmit: presentation.hasAttemptedSubmit,
      hasAttemptedPublish: presentation.hasAttemptedPublish,
      publishPresentationEnabled: presentation.publishPresentationEnabled,
    }
    const visible = shouldShowFieldErrorPresentation(
      fieldPath,
      session,
      presentation.inactivePaths,
      touchedPaths,
    )

    return visible ? decoded : undefined
  }, [
    eligible,
    fieldPath,
    presentation.hasAttemptedPublish,
    presentation.hasAttemptedSubmit,
    presentation.inactivePaths,
    presentation.issues,
    presentation.publishPresentationEnabled,
    presentation.validationPresentation,
    touchedPaths,
  ])

  const hasIssue = React.useMemo(() => {
    if (!fieldPath || !eligible) return false
    return (
      Boolean(resolveFieldIssueDisplayMessage(fieldPath, presentation.issues)) ||
      findRoutedIssueForFieldPath(presentation.issues, fieldPath) !== undefined
    )
  }, [eligible, fieldPath, presentation.issues])

  return {
    message,
    invalid: message ? true : hasIssue ? true : undefined,
    hasIssue,
  }
}
