'use client'

import * as React from 'react'

import { FieldRow } from '../../components/ui/field-row'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../context/array-item-presentation.context'
import { useFormSectionContext } from '../context/form-section.context'
import type { RowConfig } from '../field-config'
import { isRowSlotItem } from '../field-config'
import { FieldNode, FieldSeparatorWrapper, useVisibilityValues } from './form-conditional.client'
import { SlotFormItemSection } from '../renderers/fields/slot-field-renderer.client'

interface RowFieldSectionProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
  depth: number
}

export function RowFieldSection({
  item,
  index,
  idPrefix,
  namePrefix,
  depth,
}: RowFieldSectionProps) {
  const parentContext = useFormSectionContext()
  const parent = React.useContext(ArrayItemPresentationContext)
  const suppress = resolveErrorPlacement(item.errorPlacement, 'detailed', true)
  const value = suppress ? { ...parent, suppressFieldErrorText: true } : parent

  return (
    <React.Fragment key={`row-${index}`}>
      <FieldSeparatorWrapper separator={item.separator}>
        <ArrayItemPresentationContext.Provider value={value}>
          <FieldRow className={item.className}>
            {item.fields.map((field) => {
              if (isRowSlotItem(field)) {
                return (
                  <SlotFormItemSection
                    key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
                    item={field}
                    parentContext={parentContext}
                    depth={depth}
                    namePrefix={namePrefix}
                  />
                )
              }

              return (
                <FieldNode
                  key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
                  config={field}
                  idPrefix={idPrefix}
                  namePrefix={namePrefix}
                />
              )
            })}
          </FieldRow>
        </ArrayItemPresentationContext.Provider>
      </FieldSeparatorWrapper>
    </React.Fragment>
  )
}

interface ConditionalRowProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Hides a schema row when its `visibility` predicate is false. */
export function ConditionalRow({ item, index, idPrefix, namePrefix, depth }: ConditionalRowProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return (
    <RowFieldSection
      item={item}
      index={index}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
    />
  )
}
