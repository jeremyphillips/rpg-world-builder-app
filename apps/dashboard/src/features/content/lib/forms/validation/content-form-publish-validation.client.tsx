import { useEffect, useMemo } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { collectTabbedFormResolverItems, type FormIssue, type TabbedFormTab } from '@rpg/ui/form'

import {
  evaluateContentPublishFormIssues,
  CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE,
} from './content-publish-validation.lib'
import {
  useContentPublishValidation,
  type ContentPublishValidation,
} from './use-content-publish-validation'

type RoutedPublishIssues = { status: 'ok'; issues: FormIssue[] } | { status: 'failed' }

function routedPublishIssues(
  schema: ZodType<FieldValues>,
  values: FieldValues,
  fields: ReturnType<typeof collectTabbedFormResolverItems>,
): RoutedPublishIssues {
  try {
    const issues = evaluateContentPublishFormIssues(schema, values, fields)
    if (issues === null) return { status: 'ok', issues: [] }
    return { status: 'ok', issues }
  } catch {
    return { status: 'failed' }
  }
}

function routingFailedIssue(): FormIssue {
  return {
    path: '',
    message: CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE,
    severity: 'crossRow',
  }
}

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
    const routed = routedPublishIssues(schema, getValues(), fields)
    if (routed.status === 'failed') {
      onValidationChange({ issues: [routingFailedIssue()] })
      return
    }
    // Not-ready with no routed issues is a transient parse — keep the surfaced list.
    if (routed.issues.length === 0 && !validation.isPublishReady) return
    onValidationChange({ issues: routed.issues })
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
