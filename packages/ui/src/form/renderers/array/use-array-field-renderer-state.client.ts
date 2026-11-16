'use client'

/**
 * Aggregates derived state for `ArrayFieldRenderer`.
 *
 * Composes layout chrome (variant, reorder, collapse), validation issue
 * summaries, focus navigation, and append controls into one hook so the
 * renderer stays a thin fieldset shell.
 */
import * as React from 'react'
import { useFormContext, type UseFieldArrayReturn } from 'react-hook-form'

import type { ArrayConfig } from '../../field-config'
import {
  resolveArraySectionDensityParent,
  useFormSectionContext,
} from '../../context/form-section.context'
import { useArrayItemCollapseState } from '../../hooks/use-array-item-collapse-state.client'
import { useFormValidationPresentation } from '../../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../../context/form-ui.context'
import { useFocusFirstArrayIssue } from './use-array-focus-first-issue.client'
import { resolveArrayFieldRendererChrome } from './resolve-array-field-renderer-chrome.lib'
import { resolveArrayRequiredMarker } from './array-field-empty-state.lib'
import { resolveArrayShowSectionHeader } from './resolve-array-show-section-header.lib'
import { useArrayFieldAppendControls } from './use-array-field-append-controls.client'
import {
  isPresentationSessionExpanded,
  type PresentationSessionFlags,
} from '../../errors/resolve-field-error-presentation.lib'
import {
  resolveArrayAppendAvailability,
  resolveArrayValidationCounts,
} from './use-array-field-renderer-state.lib'
import { resolveFieldArrayRowKey } from './resolve-field-array-row-key.lib'
import { getArrayFieldMutators } from '../../context/array-field-mutators.registry'

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
  const { control, setValue } = useFormContext()
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const sectionContext = useFormSectionContext()
  const { depth, inRhythmStack } = sectionContext
  const chrome = resolveArrayFieldRendererChrome({
    config,
    parentContext: resolveArraySectionDensityParent(sectionContext),
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
    itemLegend,
    sectionLabel,
    sectionHint,
    labelMode,
    legendFieldSize,
    legendRhythm,
    headingScale,
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
    config,
    getItemValues,
  })

  const { addEnabled, addDisabledReason } = resolveArrayAppendAvailability({
    config,
    fieldsLength: fields.length,
    max,
    watchedItems,
    getItemValues,
  })
  const validationCountSession: PresentationSessionFlags = {
    validationPresentation: validation.validationPresentation,
    hasAttemptedSubmit: validation.hasAttemptedSubmit,
    hasAttemptedPublish: validation.hasAttemptedPublish,
    publishPresentationEnabled: validation.publishPresentationEnabled,
  }
  const showValidationCounts = isPresentationSessionExpanded(validationCountSession)

  const { containerIssue, hasContainerIssue, invalidRowCount, arrayIssueCount } =
    resolveArrayValidationCounts({
      fullName,
      showValidationCounts,
      issues: validation.issues,
    })

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
    (rhfField: Record<string, unknown>, index: number) => {
      const itemValues = (getValues(`${fullName}.${index}`) ?? {}) as Record<string, unknown>
      const rowRemovable =
        typeof itemConfig.removable === 'function'
          ? itemConfig.removable(itemValues, index)
          : itemConfig.removable
      const rowCollapsible =
        collapsible &&
        (itemConfig.resolveCollapsible ? itemConfig.resolveCollapsible(itemValues, index) : true)
      return {
        config,
        idPrefix,
        fullName,
        index,
        itemId: resolveFieldArrayRowKey(rhfField, config.keyName),
        legend: itemLegend,
        itemBodyStackClasses,
        canRemove: rowRemovable && !itemConfig.removeSlot,
        showDefaultItemRemove: rowRemovable && !itemConfig.removeSlot,
        showDragHandle: reorderConfigured,
        fieldsLength: fields.length,
        collapsible: rowCollapsible,
        reserveCaretSlot: collapsible,
        variant,
        collapsedIds,
        onToggleCollapse: toggleCollapse,
        onRemove: () => {
          if (itemConfig.remove) {
            itemConfig.remove({
              index,
              row: getValues(`${fullName}.${index}`),
              getValues: (path) => getValues(path),
              removeAt: (path, rowIndex) => {
                const mutators = getArrayFieldMutators(control, path)
                if (mutators) {
                  mutators.remove(rowIndex)
                  return
                }
                const current = getValues(path)
                if (!Array.isArray(current)) return
                setValue(
                  path,
                  current.filter((_, entryIndex) => entryIndex !== rowIndex),
                  { shouldDirty: true, shouldTouch: true, shouldValidate: true },
                )
              },
              setValue: (path, value) =>
                setValue(path, value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                }),
            })
            return
          }
          remove(index)
        },
      }
    },
    [
      collapsedIds,
      collapsible,
      config,
      fields.length,
      fullName,
      getValues,
      idPrefix,
      itemBodyStackClasses,
      control,
      itemConfig,
      remove,
      setValue,
      reorderConfigured,
      sectionLabel,
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
    sectionLabel,
    sectionHint,
    labelMode,
    legendFieldSize,
    legendRhythm,
    headingScale,
    nested,
    omitSectionBottomMargin,
    showSectionHeader: resolveArrayShowSectionHeader({
      labelMode,
      sectionHint,
      addActionLayout,
      hasAddAction: addAction !== null,
      arrayIssueCount,
      hasContainerIssue,
      config,
    }),
    sortableEnabled,
  }
}
