'use client'

/**
 * Aggregates derived state for `ArrayFieldRenderer`.
 *
 * Composes layout chrome (variant, reorder, collapse), validation issue
 * summaries, focus navigation, and append controls into one hook so the
 * renderer stays a thin fieldset shell.
 */
import * as React from 'react'
import type { UseFieldArrayReturn } from 'react-hook-form'

import {
  fieldArrayItemListClasses,
  fieldStackRhythmVariants,
  resolveArrayLegendScale,
} from '../../components/ui/field.variants'
import {
  isNestedArraySection,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../config/array-item-config.lib'
import type { ArrayConfig } from '../field-config'
import { useFormSectionContext } from '../context/form-section.context'
import { countInvalidArrayItems, countIssuesForArrayPath } from '../errors'
import { useArrayItemCollapseState } from '../hooks/use-array-item-collapse-state.client'
import { useFormValidationPresentation } from '../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../context/form-ui.context'
import { useFocusFirstArrayIssue } from './use-focus-first-array-issue.client'
import { useArrayFieldAppend } from './use-array-field-append.client'

type UseArrayFieldRendererStateOptions = {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  fields: UseFieldArrayReturn['fields']
  append: UseFieldArrayReturn['append']
  remove: UseFieldArrayReturn['remove']
  getValues: (name: string) => unknown
  watchedItems: unknown[] | undefined
}

export function useArrayFieldRendererState({
  config,
  idPrefix,
  fullName,
  fields,
  append,
  remove,
  getValues,
  watchedItems,
}: UseArrayFieldRendererStateOptions) {
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
  const sortableEnabled = reorder === 'dragHandle' && fields.length > 1
  const collapsible = itemCollapsible && variant === 'detailed'

  const getItemValues = React.useCallback(
    (index: number) => (getValues(`${fullName}.${index}`) ?? {}) as Record<string, unknown>,
    [getValues, fullName],
  )

  const { collapsedIds, toggleCollapse } = useArrayItemCollapseState({
    fullName,
    collapsible,
    fields,
    itemCollapseKey,
    getItemValues,
  })

  const canRemove = fields.length > min
  const showDefaultItemRemove = !config.hideItemRemove && !config.itemRemoveSlot
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

  const { appendItem, appendFromAddMenu, appendWithDefaults, addMenuItems } = useArrayFieldAppend({
    config,
    fullName,
    fields,
    append,
    getValues,
    watchedItems,
    collapsible,
    itemCollapseKey,
    addValidationSessionExpandKeys,
  })

  const itemProps = React.useCallback(
    (rhfField: (typeof fields)[number], index: number) => ({
      config,
      idPrefix,
      fullName,
      index,
      itemId: rhfField.id,
      legend,
      itemBodyStackClasses,
      canRemove,
      showDefaultItemRemove,
      showDragHandle: sortableEnabled,
      collapsible,
      variant,
      collapsedIds,
      onToggleCollapse: toggleCollapse,
      onRemove: () => remove(index),
    }),
    [
      canRemove,
      showDefaultItemRemove,
      collapsedIds,
      collapsible,
      config,
      fullName,
      idPrefix,
      itemBodyStackClasses,
      legend,
      remove,
      sortableEnabled,
      toggleCollapse,
      variant,
    ],
  )

  return {
    addLabel,
    addMenuItems,
    appendFromAddMenu,
    appendItem,
    appendWithDefaults,
    arrayIssueCount,
    canAdd,
    focusFirstArrayIssue,
    invalidRowCount,
    itemListClasses,
    itemProps,
    legend,
    legendScale,
    legendSize,
    nested,
    showLegend: legend.trim().length > 0,
    sortableEnabled,
  }
}
