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

export type ContentPublishReadiness = {
  valid: boolean
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

function computePublishReadiness<TValues extends FieldValues>(
  schema: ZodType<TValues>,
  values: TValues,
  tabs: TabbedFormTab[],
  fields: FormItem[],
): Pick<ContentPublishReadiness, 'valid' | 'invalidTabIds'> {
  const parsed = schema.safeParse(values)
  if (parsed.success) {
    return { valid: true, invalidTabIds: new Set() }
  }

  const tabStates = resolveTabValidationState(
    zodIssuesToFormIssues(parsed.error.issues),
    tabs,
    fields,
  )
  return {
    valid: false,
    invalidTabIds: new Set(
      tabStates.filter((state) => state.count > 0).map((state) => state.tabId),
    ),
  }
}

/**
 * Debounced silent publish-schema parse. Never writes form state.
 * Section validity uses the same path→tab ownership as tab badges.
 * The first snapshot is synchronous so the rail never paints a false Ready.
 */
export function useContentPublishReadiness<TValues extends FieldValues>({
  schema,
  tabs,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: {
  schema: ZodType<TValues>
  tabs: TabbedFormTab[]
  debounceMs?: number
}): ContentPublishReadiness {
  const { control, getValues } = useFormContext<TValues>()
  const watchedValues = useWatch({ control })
  const fields = useMemo(
    () => tabs.flatMap((tab) => [...tab.fields, ...(tab.resolverFields ?? [])]),
    [tabs],
  )

  const [readiness, setReadiness] = useState<ContentPublishReadiness>(() => ({
    ...computePublishReadiness(schema, getValues(), tabs, fields),
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
    setReadiness((current) => ({ ...current, isChecking: true }))

    const timeoutId = setTimeout(() => {
      const next = computePublishReadiness(schema, getValues(), tabs, fields)
      if (requestId !== requestIdRef.current) return

      setReadiness({ ...next, isChecking: false })
    }, debounceMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [debounceMs, fields, getValues, schema, tabs, watchedValues])

  return readiness
}
