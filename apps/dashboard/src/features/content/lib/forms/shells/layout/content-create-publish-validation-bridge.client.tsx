import { useContext, useEffect, useRef } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { FormUiContext, prepareFormIssues, type FormIssue, type FormItem } from '@rpg/ui/form'

import { applyContentPublishValidation } from '../../validation/content-publish-validation.lib'

type ContentCreatePublishValidationBridgeProps = {
  publishSchema: ZodType<FieldValues>
  publishFields: FormItem[]
  onPublishAttempted: () => void
  onPublishIssuesChange: (validation: { issues: readonly FormIssue[] }) => void
}

/**
 * On create, RHF's draft resolver can block submit before publish validation runs.
 * After any failed submit attempt, surface the full publish issue set for badges and summary.
 */
export function ContentCreatePublishValidationBridge({
  publishSchema,
  publishFields,
  onPublishAttempted,
  onPublishIssuesChange,
}: ContentCreatePublishValidationBridgeProps) {
  const form = useFormContext<FieldValues>()
  const ui = useContext(FormUiContext)
  const submitCount = form.formState.submitCount
  const prevSubmitCountRef = useRef(submitCount)

  useEffect(() => {
    if (submitCount <= prevSubmitCountRef.current) return
    prevSubmitCountRef.current = submitCount

    if (Object.keys(form.formState.errors).length === 0) return

    const applied = applyContentPublishValidation(
      form,
      publishSchema,
      form.getValues(),
      publishFields,
    )
    if (!applied) return

    const values = form.getValues()
    const issues = prepareFormIssues(
      applied.map((issue) => ({
        path: issue.path.split('.'),
        message: issue.message,
      })),
      publishFields,
      values as Record<string, unknown>,
    )

    ui.markPublishAttempted()
    onPublishAttempted()
    onPublishIssuesChange({ issues })
  }, [
    form,
    onPublishAttempted,
    onPublishIssuesChange,
    publishFields,
    publishSchema,
    submitCount,
    ui,
  ])

  return null
}
