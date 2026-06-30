'use client'

import { useWatch } from 'react-hook-form'

/** Watches `dependsOn` fields and returns a map keyed by relative field names. */
export function useDependsOnValues(
  dependsOn: readonly string[],
  namePrefix?: string,
): Record<string, unknown> {
  const prefixedDeps = namePrefix ? dependsOn.map((dep) => `${namePrefix}.${dep}`) : [...dependsOn]
  const watched = useWatch({
    name: prefixedDeps.length > 0 ? prefixedDeps : [],
    disabled: dependsOn.length === 0,
  })
  const values: Record<string, unknown> = {}
  const watchedValues = Array.isArray(watched) ? watched : dependsOn.length === 1 ? [watched] : []
  dependsOn.forEach((name, index) => {
    values[name] = watchedValues[index]
  })
  return values
}
