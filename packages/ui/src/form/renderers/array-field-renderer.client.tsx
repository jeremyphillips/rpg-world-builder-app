'use client'

import * as React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '../../components/ui/button.client'
import {
  fieldArrayItemListClasses,
  fieldGroupBottomMarginClasses,
  fieldGroupLegendVariants,
  fieldStackRhythmVariants,
  fieldSetResetClasses,
  resolveArrayLegendScale,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import {
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import {
  isNestedArraySection,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../config/array-item-config.lib'
import { buildItemDefaultValues, type ArrayConfig } from '../field-config'
import { buildArraySectionChildContext } from '../containers/form-section-child-context.lib'
import { useVisibilityValues } from '../containers/form-conditional.client'
import { type ArrayFieldItemContentProps } from './array-field-item-content.client'
import { ArrayFieldItemList } from './array-field-item-list.client'
import { useFocusFirstArrayIssue } from './use-focus-first-array-issue.client'
import { useArrayItemCollapseState } from '../hooks/use-array-item-collapse-state.client'
import { useFormValidationPresentation } from '../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../context/form-ui.context'
import { countInvalidArrayItems, countIssuesForArrayPath } from '../errors'
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
  const { fields, append, remove, move } = useFieldArray({ name: fullName })
  const { getValues } = useFormContext()
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const { rhythm, size, depth } = useFormSectionContext()
  const {
    addLabel = 'Add item',
    min = 0,
    max,
    legend,
    legendSize = 'array',
    itemCollapsible = false,
    itemCollapseKey,
  } = config
  const legendScale = legendSize === 'array' ? resolveArrayLegendScale(size) : 'default'
  const itemListClasses = fieldArrayItemListClasses({ rhythm, size })
  const itemBodyStackClasses = fieldStackRhythmVariants({ rhythm })
  const nested = isNestedArraySection(depth)
  const variant = resolveArrayItemVariant(config, { nested })
  const reorder = resolveArrayItemReorder(config)
  const sortable = reorder === 'dragHandle'
  const sortableEnabled = sortable && fields.length > 1
  const showDragHandle = sortableEnabled
  const collapsible = itemCollapsible && variant === 'detailed' && !nested

  const getItemValues = React.useCallback(
    (index: number) => (getValues(`${fullName}.${index}`) ?? {}) as Record<string, unknown>,
    [getValues, fullName],
  )

  const { collapsedIds, toggleCollapse } = useArrayItemCollapseState({
    fullName,
    collapsible,
    fields,
    itemCollapseKey: itemCollapseKey,
    getItemValues,
  })

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max
  const invalidRowCount = validation.hasAttemptedSubmit
    ? countInvalidArrayItems(validation.issues, fullName)
    : 0
  const arrayIssueCount = validation.hasAttemptedSubmit
    ? countIssuesForArrayPath(validation.issues, fullName)
    : 0

  const focusFirstArrayIssue = useFocusFirstArrayIssue({
    fullName,
    idPrefix,
    arrayPattern: config.arrayPattern,
    itemCollapseKey: config.itemCollapseKey,
    issues: validation.issues,
    fields: validation.fields,
    getItemValues,
    addValidationSessionExpandKeys,
  })

  const staticItemDefaults = React.useMemo(
    () => buildItemDefaultValues(config.fields),
    [config.fields],
  )

  function appendItem() {
    const nextDefaults = config.appendDefaults
      ? config.appendDefaults((getValues(fullName) as unknown[]) ?? [])
      : staticItemDefaults
    append(nextDefaults)
  }

  const itemProps = (rhfField: (typeof fields)[number], index: number) => ({
    config,
    idPrefix,
    fullName,
    index,
    itemId: rhfField.id,
    legend,
    itemBodyStackClasses,
    canRemove,
    showDragHandle,
    collapsible,
    variant,
    collapsedIds,
    onToggleCollapse: toggleCollapse,
    onRemove: () => remove(index),
  })

  const showLegend = legend.trim().length > 0

  return (
    <fieldset
      id={config.id}
      className={cn(
        fieldSetResetClasses,
        !nested && fieldGroupBottomMarginClasses,
        config.className,
      )}
    >
      {showLegend ? (
        <legend className={fieldGroupLegendVariants({ size: legendSize, scale: legendScale })}>
          {legend}
          <ArrayLegendIssueLink
            issueCount={arrayIssueCount}
            invalidRowCount={invalidRowCount}
            sectionLabel={legend}
            onPress={focusFirstArrayIssue}
          />
        </legend>
      ) : null}
      <div className={itemListClasses}>
        <ArrayFieldItemList
          fields={fields}
          sortableEnabled={sortableEnabled}
          itemProps={itemProps}
          onMove={move}
        />
        {canAdd ? (
          <Button variant="outline" size="sm" onClick={appendItem} aria-label={addLabel}>
            {addLabel}
          </Button>
        ) : null}
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
