'use client'

import * as React from 'react'

import { FieldRow } from '../../components/ui/field-row'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../context/array-item-presentation.context'
import type { RowConfig } from '../field-config'
import { FieldNode, useVisibilityValues, withFieldSeparator } from './form-conditional.client'

interface RowFieldSectionProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

export function RowFieldSection({ item, index, idPrefix, namePrefix }: RowFieldSectionProps) {
  const parent = React.useContext(ArrayItemPresentationContext)
  const suppress = resolveErrorPlacement(item.errorPlacement, 'detailed', true)
  const value = suppress ? { ...parent, suppressFieldErrorText: true } : parent

  return (
    <React.Fragment key={`row-${index}`}>
      {withFieldSeparator(
        item.separator,
        <ArrayItemPresentationContext.Provider value={value}>
          <FieldRow layout={item.layout} className={item.className}>
            {item.fields.map((field) => (
              <FieldNode
                key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
                config={field}
                idPrefix={idPrefix}
                namePrefix={namePrefix}
              />
            ))}
          </FieldRow>
        </ArrayItemPresentationContext.Provider>,
      )}
    </React.Fragment>
  )
}

interface ConditionalRowProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

/** Hides a schema row when its `visibility` predicate is false. */
export function ConditionalRow({ item, index, idPrefix, namePrefix }: ConditionalRowProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return <RowFieldSection item={item} index={index} idPrefix={idPrefix} namePrefix={namePrefix} />
}
