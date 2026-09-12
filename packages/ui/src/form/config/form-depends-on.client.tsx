'use client'

import * as React from 'react'
import { useWatch } from 'react-hook-form'

import { resolveDependsOnWatchName } from './form-depends-on.lib'

/** Watches `dependsOn` fields and returns a map keyed by relative field names. */
export function useDependsOnValues(
  dependsOn: readonly string[],
  namePrefix?: string,
): Record<string, unknown> {
  const prefixedDeps = React.useMemo(
    () => dependsOn.map((dep) => resolveDependsOnWatchName(dep, namePrefix)),
    [dependsOn, namePrefix],
  )
  const watched = useWatch({
    name: prefixedDeps.length > 0 ? prefixedDeps : [],
    disabled: dependsOn.length === 0,
  })
  return React.useMemo(() => {
    const values: Record<string, unknown> = {}
    const watchedValues = Array.isArray(watched) ? watched : dependsOn.length === 1 ? [watched] : []
    dependsOn.forEach((name, index) => {
      values[name] = watchedValues[index]
    })
    return values
  }, [dependsOn, watched])
}
