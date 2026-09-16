'use client'

import { FieldRowAnatomyProvider } from '../../components/ui/field-row-anatomy.context'
import { resolveFieldRowAnatomyPresentation } from '../../components/ui/field-row-anatomy.variants'
import { FieldRow } from '../../components/ui/field-row'
import { cn } from '../../lib/utils'
import { FieldNode } from '../containers/form-conditional.client'
import { resolveRowFieldWidths } from '../config/resolve-row-field-widths.lib'
import {
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import type { RowFieldItem } from '../field-config'
import { isRowSlotItem, resolveFieldConfigPrimaryName } from '../field-config'
import { SlotFormItemSection } from '../renderers/fields/slot-field-renderer.client'

export interface AnatomyFieldRowProps {
  fields: readonly RowFieldItem[]
  gap?: 'form' | 'compact'
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
  className,
  idPrefix,
  namePrefix,
  parentContext,
  depth = 0,
}: AnatomyFieldRowProps) {
  const sectionContext = useFormSectionContext()
  const slotParentContext = parentContext ?? sectionContext
  const presentation = resolveFieldRowAnatomyPresentation(resolveRowFieldWidths(fields), gap)

  return (
    <FieldRowAnatomyProvider>
      <FieldRow
        layout="anatomy-grid"
        gap={gap}
        className={cn(presentation.className, className)}
        style={presentation.style}
      >
        {fields.map((field) => {
          if (isRowSlotItem(field)) {
            return (
              <SlotFormItemSection
                key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
                item={field}
                parentContext={slotParentContext}
                depth={depth}
                namePrefix={namePrefix}
              />
            )
          }

          return (
            <FieldNode
              key={
                namePrefix
                  ? `${namePrefix}.${resolveFieldConfigPrimaryName(field)}`
                  : resolveFieldConfigPrimaryName(field)
              }
              config={field}
              idPrefix={idPrefix}
              namePrefix={namePrefix}
            />
          )
        })}
      </FieldRow>
    </FieldRowAnatomyProvider>
  )
}
