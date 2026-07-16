'use client'

/**
 * Entry component for repeatable array fields (`kind: 'array'`).
 * Dispatched from `form-item-node.client.tsx` via `ArrayFormItemSection` or
 * `ConditionalArrayField`.
 */
import * as React from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  fieldGroupBottomMarginClasses,
  fieldSetResetClasses,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import { registerArrayFieldMutators } from '../../context/array-field-mutators.registry'
import type { ArrayConfig } from '../../field-config'
import { ArrayFieldAddControl } from './array-field-add-control.client'
import { ArrayFieldLegend } from './array-field-legend.client'
import { type ArrayFieldItemContentProps } from './array-field-item-content.client'
import { ArrayFieldItemList } from './array-field-item-list.client'
import { useArrayFieldRendererState } from './use-array-field-renderer-state.client'

export type { ArrayFieldItemContentProps }

export interface ArrayFieldRendererProps {
  config: ArrayConfig
  idPrefix: string
  /** Resolved full RHF field name for the array (e.g. `"traits"` or `"root.0.traits"`). */
  fullName: string
}

/**
 * Renders a repeatable array of field groups backed by RHF's `useFieldArray`.
 * Each item renders with header chrome (drag handle, optional collapse, remove)
 * and an "Add" button below the list.
 *
 * Must be rendered inside a `FormProvider`.
 */
export function ArrayFieldRenderer({ config, idPrefix, fullName }: ArrayFieldRendererProps) {
  const form = useFormContext()
  const { fields, append, remove, move } = useFieldArray({ name: fullName })
  const { getValues } = form
  const watchedItems = useWatch({ name: fullName }) as unknown[] | undefined

  const state = useArrayFieldRendererState({
    config,
    idPrefix,
    fullName,
    fields,
    append,
    remove,
    getValues,
    watchedItems,
  })

  React.useEffect(() => {
    return registerArrayFieldMutators(form.control, fullName, {
      getValues: () => fields.map((_, index) => form.getValues(`${fullName}.${index}`)),
      remove,
      append: state.appendWithDefaults,
    })
  }, [form, fullName, fields, remove, state.appendWithDefaults])

  const inlineAddInLegend = state.addActionLayout === 'inline' && state.showLegend

  const addControl = (
    <ArrayFieldAddControl
      canAdd={state.canAdd && !config.hideAddAction}
      addActionLabel={state.addActionLabel}
      addActionVariant={state.addActionVariant}
      addActionLayout={state.addActionLayout}
      addActionSize={state.addActionSize}
      showAddIcon={state.showAddIcon}
      addActionMenu={config.addActionMenu}
      addActionMenuItems={state.addActionMenuItems}
      onAppendItem={state.appendItem}
      onAppendFromMenu={state.appendFromAddMenu}
    />
  )

  return (
    <fieldset
      id={config.id}
      className={cn(
        fieldSetResetClasses,
        !state.omitSectionBottomMargin && fieldGroupBottomMarginClasses,
        config.className,
      )}
    >
      {state.showLegend ? (
        <ArrayFieldLegend
          legend={state.legend}
          legendSize={state.legendSize}
          legendScale={state.legendScale}
          addActionLayout={state.addActionLayout}
          arrayIssueCount={state.arrayIssueCount}
          invalidRowCount={state.invalidRowCount}
          onFocusFirstArrayIssue={state.focusFirstArrayIssue}
          addControl={inlineAddInLegend ? addControl : undefined}
        />
      ) : null}
      <div className={state.itemListClasses}>
        <ArrayFieldItemList
          fields={fields}
          sortableEnabled={state.sortableEnabled}
          itemProps={state.itemProps}
          onMove={move}
        />
        {!inlineAddInLegend ? addControl : null}
      </div>
    </fieldset>
  )
}
