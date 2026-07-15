'use client'

import * as React from 'react'

import {
  FormSectionContext,
  type FormSectionContextValue,
} from '../../context/form-section.context'
import { buildArraySectionChildContext } from '../../containers/form-section-child-context.lib'
import type { ArrayConfig } from '../../field-config'
import { ArrayFieldRenderer } from './array-field-renderer.client'

export interface ArrayFormItemSectionProps {
  item: ArrayConfig
  parentContext: FormSectionContextValue
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Form-item wrapper for `kind: 'array'` — resolves section context and RHF name prefix. */
export function ArrayFormItemSection({
  item,
  parentContext,
  idPrefix,
  namePrefix,
  depth,
}: ArrayFormItemSectionProps) {
  const arrayChildContext = React.useMemo(
    () => buildArraySectionChildContext(parentContext, depth, item),
    [parentContext, depth, item],
  )

  const fullArrayName = namePrefix ? `${namePrefix}.${item.name}` : item.name
  return (
    <FormSectionContext.Provider value={arrayChildContext}>
      <ArrayFieldRenderer config={item} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
}
