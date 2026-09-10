import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch, type FieldValues } from 'react-hook-form'
import type { ZodIssue, ZodType } from 'zod'
import {
  resolveTabValidationState,
  type FormIssue,
  type FormItem,
  type TabbedFormTab,
} from '@rpg/ui/form'

const DEFAULT_DEBOUNCE_MS = 300

export type ContentPublishValidation = {
  isPublishReady: boolean
  issues: FormIssue[]
  invalidTabIds: ReadonlySet<string>
  isChecking: boolean
}

function zodIssuesToFormIssues(issues: ZodIssue[]): FormIssue[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
    severity: 'field' as const,
  }))
}

function computePublishValidation<TValues extends FieldValues>(
  schema: ZodType<TValues>,
  values: TValues,
  tabs: TabbedFormTab[],
  fields: FormItem[],
): Pick<ContentPublishValidation, 'isPublishReady' | 'issues' | 'invalidTabIds'> {
  const parsed = schema.safeParse(values)
  if (parsed.success) {
    return { isPublishReady: true, issues: [], invalidTabIds: new Set() }
  }

  const issues = zodIssuesToFormIssues(parsed.error.issues)
  const tabStates = resolveTabValidationState(issues, tabs, fields)
  return {
    isPublishReady: false,
    issues,
    invalidTabIds: new Set(
      tabStates.filter((state) => state.count > 0).map((state) => state.tabId),
    ),
  }
}

/**
 * Debounced silent publish-schema parse. Never writes form state.
 * Owned by content forms — feeds tab badges, field overlay, and the preview rail.
 */
export function useContentPublishValidation<TValues extends FieldValues>({
  schema,
  tabs,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: {
  schema: ZodType<TValues>
  tabs: TabbedFormTab[]
  debounceMs?: number
}): ContentPublishValidation {
  const { control, getValues } = useFormContext<TValues>()
  const watchedValues = useWatch({ control })
  const fields = useMemo(
    () => tabs.flatMap((tab) => [...tab.fields, ...(tab.resolverFields ?? [])]),
    [tabs],
  )

  const [validation, setValidation] = useState<ContentPublishValidation>(() => ({
    ...computePublishValidation(schema, getValues(), tabs, fields),
    isChecking: false,
  }))
  const requestIdRef = useRef(0)
  const isFirstRunRef = useRef(true)

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }

    const requestId = ++requestIdRef.current
    setValidation((current) => ({ ...current, isChecking: true }))

    const timeoutId = setTimeout(() => {
      const next = computePublishValidation(schema, getValues(), tabs, fields)
      if (requestId !== requestIdRef.current) return

      setValidation({ ...next, isChecking: false })
    }, debounceMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [debounceMs, fields, getValues, schema, tabs, watchedValues])

  return validation
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

  useEffect(() => {
    onValidationChange({ issues: [...validation.issues] })
  }, [onValidationChange, validation.issues])

  return null
}
