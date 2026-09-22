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
import type { FormIssue } from '../../errors/form-issue.types'
import { countInvalidArrayItems, countIssuesForArrayPath } from '../../errors'
import { useArrayItemCollapseState } from '../../hooks/use-array-item-collapse-state.client'
import { useFormValidationPresentation } from '../../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../../context/form-ui.context'
import { useFocusFirstArrayIssue } from './use-focus-first-array-issue.client'
import { resolveArrayFieldRendererChrome } from './resolve-array-field-renderer-chrome.lib'
import { resolveArrayRequiredMarker } from './array-field-empty-state.lib'
import { useArrayFieldAppendControls } from './use-array-field-append-controls.client'

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

function resolveContainerIssue(
  issues: readonly FormIssue[],
  fullName: string,
): FormIssue | undefined {
  return issues.find((issue) => issue.path === fullName)
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
  const { density, arrayLegendDensity, depth, inRhythmStack } = useFormSectionContext()
  const chrome = resolveArrayFieldRendererChrome({
    config,
    density,
    legendDensity: arrayLegendDensity,
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
    headingHint,
    legendFieldSize,
    max,
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

  const underMax = max === undefined || fields.length < max
  const canAppend = config.resolveCanAppend?.(
    watchedItems ?? fields.map((_, index) => getItemValues(index)),
  ) ?? {
    enabled: true,
  }
  const addEnabled = underMax && canAppend.enabled
  const addDisabledReason = !canAppend.enabled
    ? canAppend.reason
    : !underMax
      ? `Add up to ${max} items.`
      : undefined
  const containerIssue = resolveContainerIssue(validation.issues, fullName)
  const hasContainerIssue = containerIssue !== undefined
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

  const {
    appendItem,
    appendFromAddMenu,
    appendItemWithDefaults,
    addActionMenuItems,
    onAppendItem,
  } = useArrayFieldAppendControls({
    addAction,
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
      remove,
      reorderConfigured,
      toggleCollapse,
      variant,
    ],
  )

  return {
    emptyItemLabel,
    required: resolveArrayRequiredMarker(config),
    containerIssue,
    hasContainerIssue,
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
    onAppendItem,
    appendItemWithDefaults,
    arrayIssueCount,
    showAddControl: addAction !== null,
    addEnabled,
    addDisabledReason,
    canAdd: addEnabled,
    focusFirstArrayIssue,
    fullName,
    idPrefix,
    invalidRowCount,
    itemListClasses,
    itemProps,
    legend,
    headingHint,
    legendFieldSize,
    nested,
    omitSectionBottomMargin,
    showLegend: legend.trim().length > 0,
    sortableEnabled,
  }
}
