'use client'

import * as React from 'react'

import type { FormIssue } from '../errors/form-issue.types'
import { findRoutedIssuesForSlot } from '../errors/resolve-field-issue.lib'
import { resolveFieldErrorMessage } from '../errors/resolve-field-error-message'
import { useFormValidationPresentation } from '../hooks/use-form-validation-presentation.client'

export type SlotIssueContextValue = {
  slotPath: string
  issuePaths?: readonly string[]
}

export const SlotIssueContext = React.createContext<SlotIssueContextValue | null>(null)

export type SlotIssuePresentation = {
  issues: FormIssue[]
  message: string | undefined
  hasIssue: boolean
}

/** Issues routed to the enclosing slot via {@link SlotConfig.issuePaths} or slot claim. */
export function useSlotIssues(): SlotIssuePresentation {
  const slot = React.useContext(SlotIssueContext)
  const { issues, hasAttemptedSubmit, hasAttemptedPublish, publishPresentationEnabled } =
    useFormValidationPresentation()

  const routed = React.useMemo(() => {
    if (!slot) return []
    return findRoutedIssuesForSlot(issues, slot.slotPath, slot.issuePaths)
  }, [issues, slot])

  const showIssues = hasAttemptedSubmit || (publishPresentationEnabled && hasAttemptedPublish)

  const message = React.useMemo(() => {
    if (!showIssues || routed.length === 0) return undefined
    const first = routed[0]
    return first ? resolveFieldErrorMessage(first.message) : undefined
  }, [routed, showIssues])

  return {
    issues: showIssues ? routed : [],
    message,
    hasIssue: showIssues && routed.length > 0,
  }
}
