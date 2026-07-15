'use client'

import * as React from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  fieldGroupBottomMarginClasses,
  fieldSetResetClasses,
  resolveFieldGroupLegendClassName,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import { registerArrayFieldMutators } from '../context/array-field-mutators.registry'
import {
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import { buildArraySectionChildContext } from '../containers/form-section-child-context.lib'
import { useVisibilityValues } from '../containers/form-conditional.client'
import type { ArrayConfig } from '../field-config'
import { ArrayFieldAddControl } from './array-field-add-control.client'
import { type ArrayFieldItemContentProps } from './array-field-item-content.client'
import { ArrayFieldItemList } from './array-field-item-list.client'
import { useArrayFieldRendererState } from './use-array-field-renderer-state.client'
import { ArrayLegendIssueLink } from './array-item-issue.client'

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
        <legend
          className={resolveFieldGroupLegendClassName({
            size: state.legendSize,
            scale: state.legendScale,
          })}
        >
          {state.legend}
          <ArrayLegendIssueLink
            issueCount={state.arrayIssueCount}
            invalidRowCount={state.invalidRowCount}
            sectionLabel={state.legend}
            onPress={state.focusFirstArrayIssue}
          />
        </legend>
      ) : null}
      <div className={state.itemListClasses}>
        <ArrayFieldItemList
          fields={fields}
          sortableEnabled={state.sortableEnabled}
          itemProps={state.itemProps}
          onMove={move}
        />
        <ArrayFieldAddControl
          canAdd={state.canAdd && !config.hideAddControl}
          addLabel={state.addLabel}
          addVariant={state.addVariant}
          addMenu={config.addMenu}
          addMenuItems={state.addMenuItems}
          onAppendItem={state.appendItem}
          onAppendFromMenu={state.appendFromAddMenu}
        />
      </div>
    </fieldset>
  )
}

interface ConditionalArrayFieldProps {
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
  const childContext = React.useMemo(
    () => buildArraySectionChildContext(parentContext, depth, config),
    [parentContext, depth, config],
  )

  if (!config.visibility!.visibleWhen(values)) return null

  const fullArrayName = namePrefix ? `${namePrefix}.${config.name}` : config.name

  return (
    <FormSectionContext.Provider value={childContext}>
      <ArrayFieldRenderer config={config} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
}

interface ArrayFormItemSectionProps {
  item: ArrayConfig
  parentContext: FormSectionContextValue
  idPrefix: string
  namePrefix?: string
  depth: number
}

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
