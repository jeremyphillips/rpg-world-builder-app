'use client'

import * as React from 'react'

import { FormSectionContext, useFormSectionContext } from '../../context/form-section.context'
import { buildArraySectionChildContext } from '../../containers/form-section-child-context.lib'
import { useVisibilityValues } from '../../containers/form-conditional.client'
import type { ArrayConfig } from '../../field-config'
import { ArrayFieldRenderer } from './array-field-renderer.client'

export interface ConditionalArrayFieldProps {
  config: ArrayConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Hides a nested array when its `visibility` predicate is false. */
export function ConditionalArrayField({
  config,
  idPrefix,
  namePrefix,
  depth,
}: ConditionalArrayFieldProps) {
  const values = useVisibilityValues(config.visibility!, namePrefix)
  const parentContext = useFormSectionContext()
  const childContext = React.useMemo(
    () => buildArraySectionChildContext(parentContext, depth, config),
    [parentContext, depth, config],
  )

  if (!config.visibility!.visibleWhen(values)) return null

  const fullArrayName = namePrefix ? `${namePrefix}.${config.name}` : config.name

  return (
    <FormSectionContext.Provider value={childContext}>
      <ArrayFieldRenderer config={config} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
}
