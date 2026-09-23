'use client'

import * as React from 'react'

import { FieldRowAnatomyProvider } from '../../components/ui/field-row-anatomy.context'
import { resolveFieldRowAnatomyPresentation } from '../../components/ui/field-row-anatomy.variants'
import { useFieldRowAnatomyCollapse } from '../../components/ui/use-field-row-anatomy-collapse.client'
import { FieldRowDivider } from '../../components/ui/field-row-divider.client'
import { FieldRow } from '../../components/ui/field-row'
import { cn } from '../../lib/utils'
import { FieldNode } from '../containers/form-conditional.client'
import { resolveRowFieldWidths } from '../config/resolve-row-field-widths.lib'
import {
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import { resolveFormDensity } from '../form-density'
import type { FieldRowDivider as FieldRowDividerConfig, RowFieldItem } from '../field-config'
import { isRowSlotItem, resolveFieldConfigPrimaryName } from '../field-config'
import { SlotFormItemSection } from '../renderers/fields/slot-field-renderer.client'

export interface AnatomyFieldRowProps {
  fields: readonly RowFieldItem[]
  gap?: 'form' | 'compact'
  fieldDivider?: FieldRowDividerConfig
  className?: string
  idPrefix: string
  namePrefix?: string
  /** Section context for slot children — defaults to the current section context. */
  parentContext?: FormSectionContextValue
  depth?: number
}

/**
 * Shared anatomy-grid row for schema `kind: 'row'` sections and compact array inline rows.
 * Column tracks and subgrid participation match {@link resolveFieldRowAnatomyPresentation}.
 */
export function AnatomyFieldRow({
  fields,
  gap = 'form',
  fieldDivider,
  className,
  idPrefix,
  namePrefix,
  parentContext,
  depth = 0,
}: AnatomyFieldRowProps) {
  const sectionContext = useFormSectionContext()
  const slotParentContext = parentContext ?? sectionContext
  const { rhythm } = resolveFormDensity(sectionContext.density)
  const useFieldDivider = fieldDivider?.variant === 'pipe'
  const presentation = resolveFieldRowAnatomyPresentation(resolveRowFieldWidths(fields), gap, {
    fieldDivider: useFieldDivider,
    rhythm,
  })
  const collapse = useFieldRowAnatomyCollapse(presentation.collapseMinWidth)

  return (
    <FieldRowAnatomyProvider>
      <FieldRow
        ref={collapse.ref}
        layout="anatomy-grid"
        gap={gap}
        className={cn(presentation.className, className)}
        style={presentation.style}
        data-field-row-collapsed={collapse['data-field-row-collapsed']}
      >
        {fields.map((field, index) => {
          const fieldKey = isRowSlotItem(field)
            ? namePrefix
              ? `${namePrefix}.${field.name}`
              : field.name
            : namePrefix
              ? `${namePrefix}.${resolveFieldConfigPrimaryName(field)}`
              : resolveFieldConfigPrimaryName(field)

          const fieldNode = isRowSlotItem(field) ? (
            <SlotFormItemSection
              key={fieldKey}
              item={field}
              parentContext={slotParentContext}
              depth={depth}
              namePrefix={namePrefix}
            />
          ) : (
            <FieldNode key={fieldKey} config={field} idPrefix={idPrefix} namePrefix={namePrefix} />
          )

          if (index === 0 || !useFieldDivider) {
            return fieldNode
          }

          return (
            <React.Fragment key={`${fieldKey}-with-divider`}>
              <FieldRowDivider tone={fieldDivider.tone} rhythm={rhythm} />
              {fieldNode}
            </React.Fragment>
          )
        })}
      </FieldRow>
    </FieldRowAnatomyProvider>
  )
}
