'use client'

import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { FormValueSync } from './field-config'

function buildValuesMap(dependsOn: readonly string[], watched: unknown): Record<string, unknown> {
  const watchedValues = Array.isArray(watched) ? watched : dependsOn.length === 1 ? [watched] : []
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watchedValues[index]
  })
  return values
}

export interface FormValueSyncEffectsProps {
  valueSyncs: FormValueSync[]
}

/** Applies configured value patches when driver fields change after initial mount. */
export function FormValueSyncEffects({ valueSyncs }: FormValueSyncEffectsProps) {
  const form = useFormContext()
  const allDeps = React.useMemo(
    () => [...new Set(valueSyncs.flatMap((sync) => sync.dependsOn))],
    [valueSyncs],
  )
  const watched = useWatch({
    name: allDeps.length > 0 ? allDeps : [],
    disabled: allDeps.length === 0,
  })
  const isMountRef = React.useRef(true)
  const previousValuesRef = React.useRef<unknown[]>([])

  React.useEffect(() => {
    if (allDeps.length === 0 || valueSyncs.length === 0) return

    const currentValues = buildValuesMap(allDeps, watched)
    const currentArray = allDeps.map((name) => currentValues[name])

    if (isMountRef.current) {
      isMountRef.current = false
      previousValuesRef.current = currentArray
      return
    }

    const changedKeys = allDeps.filter(
      (_name, index) => currentArray[index] !== previousValuesRef.current[index],
    )
    previousValuesRef.current = currentArray

    if (changedKeys.length === 0) return

    const formValues = form.getValues() as Record<string, unknown>
    for (const sync of valueSyncs) {
      if (!sync.dependsOn.some((name) => changedKeys.includes(name))) continue
      const patch = sync.apply(formValues, changedKeys)
      if (!patch) continue
      for (const [key, value] of Object.entries(patch)) {
        form.setValue(key, value, { shouldDirty: true, shouldValidate: true })
      }
    }
  }, [allDeps, form, valueSyncs, watched])

  return null
}
