'use client'

import { useFormSectionContext } from '../../context/form-section.context'
import { useVisibilityValues } from '../../containers/form-conditional.client'
import type { ArrayConfig } from '../../field-config'
import { ArrayFormItemSection } from './array-form-item-section.client'

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

  if (!config.visibility!.visibleWhen(values)) return null

  return (
    <ArrayFormItemSection
      item={config}
      parentContext={parentContext}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
    />
  )
}
