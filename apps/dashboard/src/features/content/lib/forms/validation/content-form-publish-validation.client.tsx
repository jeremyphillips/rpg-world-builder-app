import { useEffect, useMemo } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { collectTabbedFormResolverItems, type TabbedFormTab } from '@rpg/ui/form'

import { tryEvaluateContentPublishFormIssues } from './content-publish-validation.lib'
import {
  useContentPublishValidation,
  type ContentPublishValidation,
} from './use-content-publish-validation'

/** Bridges live publish validation into {@link FormUiProvider} presentation props. */
export function ContentFormPublishValidationBridge({
  schema,
  tabs,
  onValidationChange,
}: {
  schema: ZodType<FieldValues>
  tabs: TabbedFormTab[]
  onValidationChange: (validation: Pick<ContentPublishValidation, 'issues'>) => void
}) {
  const validation = useContentPublishValidation({ schema, tabs, debounceMs: 0 })
  const { getValues } = useFormContext<FieldValues>()
  const fields = useMemo(() => collectTabbedFormResolverItems(tabs), [tabs])

  useEffect(() => {
    if (validation.isChecking) return
    const { issues: routedIssues, routingFailed } = tryEvaluateContentPublishFormIssues(
      schema,
      getValues(),
      fields,
    )
    if (routingFailed) {
      onValidationChange({ issues: routedIssues })
      return
    }
    // Not-ready with no routed issues is a transient parse — keep the surfaced list.
    if (routedIssues.length === 0 && !validation.isPublishReady) return
    onValidationChange({ issues: routedIssues })
  }, [
    fields,
    getValues,
    onValidationChange,
    schema,
    validation.isChecking,
    validation.isPublishReady,
    validation.issues,
  ])

  return null
}
