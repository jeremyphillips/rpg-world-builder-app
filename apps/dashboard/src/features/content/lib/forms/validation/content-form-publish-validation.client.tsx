import { useEffect, useMemo } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  collectTabbedFormResolverItems,
  prepareFormIssues,
  type FormIssue,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { evaluateContentPublishValidation } from './content-publish-validation.lib'
import {
  useContentPublishValidation,
  type ContentPublishValidation,
} from './use-content-publish-validation'

function routedPublishIssues(
  schema: ZodType<FieldValues>,
  values: FieldValues,
  fields: ReturnType<typeof collectTabbedFormResolverItems>,
): FormIssue[] | null {
  try {
    const fresh = evaluateContentPublishValidation(schema, values, fields)
    if (!fresh) return []
    return prepareFormIssues(
      fresh.map((issue) => ({
        path: issue.path.split('.'),
        message: issue.message,
      })),
      fields,
      values as Record<string, unknown>,
    )
  } catch {
    return null
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
    const fresh = routedPublishIssues(schema, getValues(), fields)
    if (fresh === null) {
      if (validation.issues.length > 0) onValidationChange({ issues: [...validation.issues] })
      return
    }
    // Not-ready with no routed issues is a transient parse — keep the surfaced list.
    if (fresh.length === 0 && !validation.isPublishReady) return
    onValidationChange({ issues: fresh })
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
