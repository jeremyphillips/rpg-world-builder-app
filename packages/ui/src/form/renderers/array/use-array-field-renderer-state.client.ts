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
} from '../../../components/ui/field.variants'
import {
  isNestedArraySection,
  resolveArrayAddAction,
  resolveArrayItemConfig,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../../config/array/array-item-config.lib'
import type { ArrayConfig } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { resolveFormDensity } from '../../form-density'
import { resolveArrayLegendPresentation } from '../../form-heading.lib'
import { hasNamedArrayHeading, resolveArrayHeading } from '../../resolve-container-heading.lib'
import { countInvalidArrayItems, countIssuesForArrayPath } from '../../errors'
import { useArrayItemCollapseState } from '../../hooks/use-array-item-collapse-state.client'
import { useFormValidationPresentation } from '../../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../../context/form-ui.context'
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
  const { density, depth, inRhythmStack, namedGroupDepth } = useFormSectionContext()
  const { rhythm, size } = resolveFormDensity(density)
  const itemConfig = resolveArrayItemConfig(config)
  const addAction = resolveArrayAddAction(config)
  const {
    label: addActionLabel = 'Add item',
    variant: addActionVariant = 'outline',
    layout: addActionLayout = 'stacked',
    size: addActionSize,
    icon: showAddIcon = true,
    menu: addActionMenu,
  } = addAction ?? {}
  const arrayHeading = resolveArrayHeading(config)
  const legend = arrayHeading?.label ?? config.legend ?? ''
  const hasNamedHeading = hasNamedArrayHeading(config)
  /** Legend typography uses depth before this array's own heading increment. */
  const legendNamedGroupDepth = hasNamedHeading ? Math.max(0, namedGroupDepth - 1) : namedGroupDepth
  const { legendSize, legendScale } = resolveArrayLegendPresentation(legendNamedGroupDepth, size)
  const { min = 0, max } = config
  const itemCollapsible = itemConfig.collapsible
  const itemCollapseKey = itemConfig.collapseKey
  const itemListClasses = fieldArrayItemListClasses({ rhythm, size })
  const itemBodyStackClasses = fieldStackRhythmVariants({ rhythm })
  const nested = isNestedArraySection(depth)
  const omitSectionBottomMargin = nested || inRhythmStack
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
  const showDefaultItemRemove = itemConfig.removable && !itemConfig.removeSlot
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
    itemCollapseKey: itemConfig.collapseKey,
    issues: validation.issues,
    fields: validation.fields,
    getItemValues,
    addValidationSessionExpandKeys,
  })

  const { appendItem, appendFromAddMenu, appendWithDefaults, addActionMenuItems } =
    useArrayFieldAppend({
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
    addAction,
    addActionLabel,
    addActionVariant,
    addActionLayout,
    addActionSize,
    showAddIcon,
    addActionMenu,
    addActionMenuItems,
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
    omitSectionBottomMargin,
    showLegend: legend.trim().length > 0,
    sortableEnabled,
  }
}
