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

import type { ArrayConfig } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { countInvalidArrayItems, countIssuesForArrayPath } from '../../errors'
import { useArrayItemCollapseState } from '../../hooks/use-array-item-collapse-state.client'
import { useFormValidationPresentation } from '../../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../../context/form-ui.context'
import { useFocusFirstArrayIssue } from './use-focus-first-array-issue.client'
import { useArrayFieldAppend } from './use-array-field-append.client'
import { resolveArrayFieldRendererChrome } from './resolve-array-field-renderer-chrome.lib'

type UseArrayFieldRendererStateOptions = {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  fields: UseFieldArrayReturn['fields']
  append: UseFieldArrayReturn['append']
  remove: UseFieldArrayReturn['remove']
  getValues: (name: string) => unknown
  watchedItems: unknown[] | undefined
  wrapSectionChrome?: boolean
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
  wrapSectionChrome,
}: UseArrayFieldRendererStateOptions) {
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const { density, depth, inRhythmStack } = useFormSectionContext()
  const chrome = resolveArrayFieldRendererChrome({
    config,
    density,
    depth,
    inRhythmStack,
    fieldsLength: fields.length,
    wrapSectionChrome,
  })
  const {
    addAction,
    addActionLabel,
    addActionVariant,
    addActionLayout,
    addActionSize,
    showAddIcon,
    addActionMenu,
    collapsible,
    emptyItemLabel,
    itemCollapseKey,
    itemConfig,
    itemListClasses,
    itemBodyStackClasses,
    legend,
    legendFieldSize,
    max,
    min,
    nested,
    omitSectionBottomMargin,
    reorderConfigured,
    sortableEnabled,
    variant,
  } = chrome

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

  const showDefaultItemRemove = itemConfig.removable && !itemConfig.removeSlot
  const canRemove = showDefaultItemRemove
  const [showEmptyMinRequired, setShowEmptyMinRequired] = React.useState(false)

  React.useEffect(() => {
    if (fields.length > 0) {
      setShowEmptyMinRequired(false)
    }
  }, [fields.length])

  const canAdd = max === undefined || fields.length < max
  const invalidRowCount = validation.hasAttemptedSubmit
    ? countInvalidArrayItems(validation.issues, fullName)
    : 0
  const arrayIssueCount = validation.hasAttemptedSubmit
    ? countIssuesForArrayPath(validation.issues, fullName)
    : 0
  const emptyMinRequiredVisible =
    fields.length === 0 &&
    min >= 1 &&
    (showEmptyMinRequired || (validation.hasAttemptedSubmit && arrayIssueCount > 0))

  const markEmptyMinRequired = React.useCallback(() => {
    if (min >= 1) {
      setShowEmptyMinRequired(true)
    }
  }, [min])

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
      showDragHandle: reorderConfigured,
      fieldsLength: fields.length,
      collapsible,
      variant,
      collapsedIds,
      onToggleCollapse: toggleCollapse,
      onRemove: () => {
        if (fields.length - 1 < min) {
          markEmptyMinRequired()
        }
        remove(index)
      },
    }),
    [
      canRemove,
      showDefaultItemRemove,
      collapsedIds,
      collapsible,
      config,
      fields.length,
      fullName,
      idPrefix,
      itemBodyStackClasses,
      legend,
      markEmptyMinRequired,
      min,
      remove,
      reorderConfigured,
      toggleCollapse,
      variant,
    ],
  )

  return {
    emptyItemLabel,
    emptyMinRequiredVisible,
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
    legendFieldSize,
    nested,
    omitSectionBottomMargin,
    showLegend: legend.trim().length > 0,
    sortableEnabled,
  }
}
