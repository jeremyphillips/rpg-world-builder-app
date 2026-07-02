'use client'

import * as React from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'

import { useFormUiContext } from '../context/form-ui.context'
import type { ArrayItemIssueGroup } from '../errors/form-issue.types'
import { groupIssuesForItemPrefix } from '../errors/group-form-issues'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import type { FormItem } from '../field-config'
import { collectArraySections } from '../errors/resolve-field-order'

function walkTouched(node: unknown, prefix: string, touchedPaths: string[]): void {
  if (node === true) {
    if (prefix) touchedPaths.push(prefix)
    return
  }

  if (Array.isArray(node)) {
    node.forEach((entry, index) => {
      if (entry === undefined || entry === null) return
      walkTouched(entry, `${prefix}.${index}`, touchedPaths)
    })
    return
  }

  if (typeof node !== 'object' || node === null) return

  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null) continue
    const nextPath = prefix ? `${prefix}.${key}` : key
    walkTouched(value, nextPath, touchedPaths)
  }
}

function flattenTouchedPaths(touchedFields: unknown): string[] {
  const paths: string[] = []
  walkTouched(touchedFields, '', paths)
  return paths
}

function isItemPrefixTouched(itemPrefix: string, touchedPaths: readonly string[]): boolean {
  return touchedPaths.some((path) => path === itemPrefix || path.startsWith(`${itemPrefix}.`))
}

export function useFormValidationPresentation(fieldsOverride?: FormItem[]) {
  const { validationPresentation, hasAttemptedSubmit, fields: contextFields } = useFormUiContext()
  const fields = fieldsOverride ?? contextFields
  const { errors, touchedFields } = useFormState()
  const issues = React.useMemo(() => prepareFormIssues(errors, fields), [errors, fields])
  const touchedPaths = React.useMemo(() => flattenTouchedPaths(touchedFields), [touchedFields])

  const shouldShowRowIssues = React.useCallback(
    (itemPrefix: string, group: Pick<ArrayItemIssueGroup, 'totalCount'>) => {
      if (group.totalCount === 0) return false
      if (validationPresentation === 'always') return true
      if (hasAttemptedSubmit) return true
      return isItemPrefixTouched(itemPrefix, touchedPaths)
    },
    [validationPresentation, hasAttemptedSubmit, touchedPaths],
  )

  return {
    fields,
    issues,
    hasAttemptedSubmit,
    shouldShowRowIssues,
  }
}

export function useArrayItemIssues(
  arrayPath: string,
  itemPrefix: string,
  itemIndex: number,
): ArrayItemIssueGroup {
  const { issues, fields } = useFormValidationPresentation()
  const fieldOrder = React.useMemo(() => {
    const section = collectArraySections(fields).find((entry) => entry.fullName === arrayPath)
    return section?.fieldOrder ?? []
  }, [fields, arrayPath])

  return React.useMemo(
    () => groupIssuesForItemPrefix(issues, itemPrefix, arrayPath, itemIndex, fieldOrder),
    [issues, itemPrefix, arrayPath, itemIndex, fieldOrder],
  )
}

const DEFAULT_DEBOUNCE_MS = 300

function useDebouncedCallback(callback: () => void, delayMs: number) {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  return React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      callback()
    }, delayMs)
  }, [callback, delayMs])
}

/** Debounced `trigger(arrayPath)` when watched driver fields change on a touched row. */
export function useDebouncedArrayItemValidationTrigger(
  arrayPath: string,
  itemPrefix: string,
  driverFieldNames: readonly string[],
  debounceMs = DEFAULT_DEBOUNCE_MS,
) {
  const { trigger } = useFormContext()
  const { touchedFields } = useFormState()
  const watchedDrivers = useWatch({
    name: driverFieldNames.map((fieldName) => `${itemPrefix}.${fieldName}`),
  })

  const touchedPaths = React.useMemo(() => flattenTouchedPaths(touchedFields), [touchedFields])
  const rowTouched = isItemPrefixTouched(itemPrefix, touchedPaths)

  const debouncedTrigger = useDebouncedCallback(() => {
    void trigger(arrayPath)
  }, debounceMs)

  React.useEffect(() => {
    if (!rowTouched) return
    debouncedTrigger()
  }, [rowTouched, watchedDrivers, debouncedTrigger])
}

/** Debounced `trigger(arrayPath)` when any row in the array has been touched. */
export function useDebouncedArrayValidationTrigger(
  arrayPath: string,
  driverFieldNames: readonly string[],
  debounceMs = DEFAULT_DEBOUNCE_MS,
) {
  const { trigger } = useFormContext()
  const { touchedFields } = useFormState()
  const items = useWatch({ name: arrayPath }) as unknown[] | undefined

  const touchedPaths = React.useMemo(() => flattenTouchedPaths(touchedFields), [touchedFields])

  const signature = React.useMemo(() => {
    if (!Array.isArray(items)) return ''
    return items
      .map((item, index) => {
        if (!isItemPrefixTouched(`${arrayPath}.${index}`, touchedPaths)) return ''
        if (typeof item !== 'object' || item === null) return String(index)
        return driverFieldNames
          .map((fieldName) => `${index}:${String((item as Record<string, unknown>)[fieldName])}`)
          .join('|')
      })
      .join(';')
  }, [arrayPath, driverFieldNames, items, touchedPaths])

  const debouncedTrigger = useDebouncedCallback(() => {
    void trigger(arrayPath)
  }, debounceMs)

  React.useEffect(() => {
    if (!signature) return
    debouncedTrigger()
  }, [signature, debouncedTrigger])
}
