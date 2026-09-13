import * as React from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { resolveDependsOnWatchName } from '../../form/config/form-depends-on.lib'

function readWatchedValue(values: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc == null || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[segment]
  }, values)
}

export function useSummaryDisclosureWatchedValues<TFieldValues extends FieldValues>(
  control: Control<TFieldValues>,
  summaryDependsOn: readonly string[] | undefined,
  namePrefix?: string,
): Record<string, unknown> {
  const allValues = useWatch({ control }) as Record<string, unknown>
  return React.useMemo(() => {
    if (!summaryDependsOn?.length) return allValues
    return summaryDependsOn.reduce<Record<string, unknown>>((acc, path) => {
      const watchPath = resolveDependsOnWatchName(path, namePrefix)
      acc[path] = readWatchedValue(allValues, watchPath)
      return acc
    }, {})
  }, [allValues, summaryDependsOn, namePrefix])
}

export const DEFAULT_SUMMARY_OPEN_LABEL = 'Change'
export const DEFAULT_SUMMARY_CLOSE_LABEL = 'Done'
export const DEFAULT_SUMMARY_UNSAVED_SUFFIX = ' · Unsaved'
