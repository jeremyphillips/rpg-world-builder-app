'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import type { FieldLayoutRecommendation } from '../../../components/ui/field-recommendation.types'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import type { ComboboxFieldConfig } from '../../field-config'

/** Resolves combobox recommendations — static props or `recommendationResolve` with RHF context. */
export function useComboboxFieldRecommendation(
  config: ComboboxFieldConfig,
  namePrefix?: string,
): FieldLayoutRecommendation | null {
  const { setValue, getValues } = useFormContext()
  const dependsOn = config.recommendationResolve?.dependsOn ?? []
  const watched = useDependsOnValues(dependsOn, namePrefix)

  return React.useMemo(() => {
    if (config.recommendation) return config.recommendation
    if (!config.recommendationResolve) return null

    const resolveName = (name: string) => (namePrefix ? `${namePrefix}.${name}` : name)

    return config.recommendationResolve.recommendationWhen(getValues() as Record<string, unknown>, {
      setValue: (name, value, options) => setValue(resolveName(name), value, options),
      getValues: (name) => (name === undefined ? getValues() : getValues(resolveName(name))),
    })
    // `watched` re-triggers when declared dependencies change.
  }, [
    config.recommendation,
    config.recommendationResolve,
    getValues,
    namePrefix,
    setValue,
    watched,
  ])
}
