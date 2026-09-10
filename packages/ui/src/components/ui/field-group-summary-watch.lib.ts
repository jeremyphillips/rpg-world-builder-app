import * as React from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

export function useSummaryDisclosureWatchedValues<TFieldValues extends FieldValues>(
  control: Control<TFieldValues>,
  summaryDependsOn: readonly string[] | undefined,
): Record<string, unknown> {
  const allValues = useWatch({ control }) as Record<string, unknown>
  return React.useMemo(() => {
    if (!summaryDependsOn?.length) return allValues
    return summaryDependsOn.reduce<Record<string, unknown>>((acc, path) => {
      acc[path] = allValues[path]
      return acc
    }, {})
  }, [allValues, summaryDependsOn])
}

export const DEFAULT_SUMMARY_OPEN_LABEL = 'Change'
export const DEFAULT_SUMMARY_CLOSE_LABEL = 'Done'
export const DEFAULT_SUMMARY_UNSAVED_SUFFIX = ' · Unsaved'
