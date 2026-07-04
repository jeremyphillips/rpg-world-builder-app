'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { useFormContext, useFormState } from 'react-hook-form'

import { cn } from '../../lib/utils'
import { useFormUiContext } from '../context/form-ui.context'
import type { FormItem } from '../field-config'
import { useTabbedFormTabValidationState } from '../hooks/use-tabbed-form-tab-validation-state.client'
import {
  buildTabbedFormErrorSummaryMessage,
  buildTabbedFormReviewLabel,
} from './tabbed-form-error-summary.lib'
import {
  tabbedFormErrorSummaryActionsClasses,
  tabbedFormErrorSummaryClasses,
  tabbedFormErrorSummaryMessageClasses,
  tabbedFormErrorSummaryReviewButtonClasses,
} from './tabbed-form-error-summary.variants'
import { navigateTabbedFormToTabIssue } from './navigate-tabbed-form-invalid-submit.client'
import type { TabbedFormTab } from './tabbed-form-panels.client'

export interface TabbedFormErrorSummaryProps {
  tabs: TabbedFormTab[]
  fields: FormItem[]
  formId: string
  onActiveTabChange: (tabId: string) => void
  className?: string
}

/** Footer validation summary with per-tab Review actions after a failed submit. */
export function TabbedFormErrorSummary({
  tabs,
  fields,
  formId,
  onActiveTabChange,
  className,
}: TabbedFormErrorSummaryProps) {
  const form = useFormContext()
  const { errors } = useFormState()
  const ui = useFormUiContext()
  const { hasAttemptedSubmit, tabStates } = useTabbedFormTabValidationState(tabs)

  const invalidTabs = React.useMemo(
    () =>
      tabs.filter((tab) => (tabStates.find((state) => state.tabId === tab.id)?.count ?? 0) > 0),
    [tabs, tabStates],
  )

  const handleReviewTab = React.useCallback(
    (tabId: string) => {
      navigateTabbedFormToTabIssue(
        form,
        fields,
        formId,
        tabs,
        ui,
        tabId,
        onActiveTabChange,
        errors,
      )
    },
    [form, fields, formId, tabs, ui, onActiveTabChange, errors],
  )

  if (!hasAttemptedSubmit || invalidTabs.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(tabbedFormErrorSummaryClasses, className)}
      data-tabbed-form-error-summary
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className={tabbedFormErrorSummaryMessageClasses}>
            {buildTabbedFormErrorSummaryMessage(invalidTabs.map((tab) => tab.label))}
          </p>
          <div className={tabbedFormErrorSummaryActionsClasses}>
            {invalidTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tabbedFormErrorSummaryReviewButtonClasses}
                onClick={() => handleReviewTab(tab.id)}
              >
                {buildTabbedFormReviewLabel(tab.label)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
