'use client'

import * as React from 'react'

import { FieldRow } from '../../components/ui/field-row'
import type { RowConfig } from '../field-config'
import { FieldNode, useVisibilityValues, withFieldSeparator } from './form-conditional.client'

interface RowFieldSectionProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

export function RowFieldSection({ item, index, idPrefix, namePrefix }: RowFieldSectionProps) {
  return (
    <React.Fragment key={`row-${index}`}>
      {withFieldSeparator(
        item.separator,
        <FieldRow layout={item.layout} className={item.className}>
          {item.fields.map((field) => (
            <FieldNode
              key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
              config={field}
              idPrefix={idPrefix}
              namePrefix={namePrefix}
            />
          ))}
        </FieldRow>,
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
