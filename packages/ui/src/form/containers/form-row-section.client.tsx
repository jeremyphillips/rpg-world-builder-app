'use client'

import * as React from 'react'

import { FieldRow } from '../../components/ui/field-row'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../context/array-item-presentation.context'
import { useFormSectionContext } from '../context/form-section.context'
import type { RowConfig } from '../field-config'
import { isRowSlotItem, resolveRowFieldAlign, resolveRowFieldGap } from '../field-config'
import { CompositeGroup } from '../presentation/composite-group.client'
import { resolveRowHeading } from '../resolve-container-heading.lib'
import { FieldNode, FieldSeparatorWrapper, useVisibilityValues } from './form-conditional.client'
import { SlotFormItemSection } from '../renderers/fields/slot-field-renderer.client'
import { resolveFormDensity } from '../form-density'

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
  const { size } = resolveFormDensity(parentContext.density)
  const parent = React.useContext(ArrayItemPresentationContext)
  const suppress = resolveErrorPlacement(item.errorPlacement, 'detailed', true)
  const value = suppress ? { ...parent, suppressFieldErrorText: true } : parent
  const heading = resolveRowHeading(item)

  const row = (
    <FieldRow
      align={resolveRowFieldAlign(item)}
      gap={resolveRowFieldGap(item.spacing)}
      className={item.className}
    >
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
  )

  const body = heading ? (
    <CompositeGroup heading={heading} size={size} useFieldset={item.fields.length > 1}>
      {row}
    </CompositeGroup>
  ) : (
    row
  )

  return (
    <React.Fragment key={`row-${index}`}>
      <FieldSeparatorWrapper separator={item.separator}>
        <ArrayItemPresentationContext.Provider value={value}>
          {body}
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
