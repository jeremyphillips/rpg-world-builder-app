'use client'

import * as React from 'react'

import type { FieldWidth } from '../../../components/ui/field-control.variants'
import { cn } from '../../../lib/utils'
import { FieldNode } from '../../containers/form-conditional.client'
import {
  ArrayItemPresentationContext,
  type ArrayItemPresentationContextValue,
} from '../../context/array-item-presentation.context'
import {
  useFormSectionContext,
  type FormSectionContextValue,
} from '../../context/form-section.context'
import { resolveRowFieldWidths } from '../../config/resolve-row-field-widths.lib'
import type { RowConfig, RowFieldItem } from '../../field-config'
import { isRowSlotItem, resolveFieldConfigPrimaryName } from '../../field-config'
import { resolveRowFieldGap } from '../../field-config'
import { SlotFormItemSection } from '../fields/slot-field-renderer.client'

import { ArrayItemAnatomyGrid } from './array-item-anatomy-grid.client'
import type { ArrayFieldGap } from './array-item-anatomy-grid.variants'
import { arrayItemCompactSummaryClasses } from './array-item-toolbar.variants'

export interface ArrayItemAnatomyInlineRowProps {
  titleId: string
  ariaLabel: string
  showGrip: boolean
  inlineFields: readonly RowFieldItem[]
  inlineRow?: RowConfig
  idPrefix: string
  namePrefix?: string
  rowPresentationValue: ArrayItemPresentationContextValue
  grip: React.ReactNode
  actions: React.ReactNode
  summary?: React.ReactNode
  className?: string
}

function resolveInlineFieldKey(field: RowFieldItem, namePrefix?: string): string {
  const leaf = isRowSlotItem(field) ? field.name : resolveFieldConfigPrimaryName(field)
  return namePrefix ? `${namePrefix}.${leaf}` : leaf
}

function ArrayItemAnatomyInlineField({
  field,
  idPrefix,
  namePrefix,
  parentContext,
  depth,
}: {
  field: RowFieldItem
  idPrefix: string
  namePrefix?: string
  parentContext: FormSectionContextValue
  depth: number
}) {
  if (isRowSlotItem(field)) {
    return (
      <SlotFormItemSection
        item={field}
        parentContext={parentContext}
        depth={depth}
        namePrefix={namePrefix}
      />
    )
  }

  return <FieldNode config={field} idPrefix={idPrefix} namePrefix={namePrefix} />
}

/**
 * Production compact inline array row — shared anatomy grid with direct field participants.
 */
export function ArrayItemAnatomyInlineRow({
  titleId,
  ariaLabel,
  showGrip,
  inlineFields,
  inlineRow,
  idPrefix,
  namePrefix,
  rowPresentationValue,
  grip,
  actions,
  summary,
  className,
}: ArrayItemAnatomyInlineRowProps) {
  const parentContext = useFormSectionContext()
  const fieldWidths: readonly FieldWidth[] = resolveRowFieldWidths(inlineFields)
  const fieldGap: ArrayFieldGap =
    resolveRowFieldGap(inlineRow?.spacing) === 'compact' ? 'default' : 'dense'

  return (
    <div
      className={cn('min-w-0', className)}
      data-array-item-flat-no-header=""
      data-array-item-content-layout="inline"
      data-array-item-anatomy-inline-row=""
    >
      <span id={titleId} className="sr-only">
        {ariaLabel}
      </span>
      <ArrayItemPresentationContext.Provider value={rowPresentationValue}>
        <ArrayItemAnatomyGrid
          fieldWidths={fieldWidths}
          showGrip={showGrip}
          fieldGap={fieldGap}
          className={inlineRow?.className}
          grip={grip}
          actions={actions}
        >
          {inlineFields.map((field) => (
            <ArrayItemAnatomyInlineField
              key={resolveInlineFieldKey(field, namePrefix)}
              field={field}
              idPrefix={idPrefix}
              namePrefix={namePrefix}
              parentContext={parentContext}
              depth={1}
            />
          ))}
        </ArrayItemAnatomyGrid>
      </ArrayItemPresentationContext.Provider>
      {summary ? <div className={cn(arrayItemCompactSummaryClasses, 'mt-0')}>{summary}</div> : null}
    </div>
  )
}
