'use client'

import { useWatch } from 'react-hook-form'
import type { useSortable } from '@dnd-kit/sortable'

import { useDependsOnValues } from '../../config/form-depends-on.client'
import { normalizeArrayItemContent } from '../../config/array/array-item-content-normalizer.lib'
import {
  resolveArrayItemConfig,
  resolveArrayItemHeader,
  resolveArrayItemHeaderLabels,
  resolveArrayItemReorder,
} from '../../config/array/array-item-config.lib'
import {
  resolveArrayItemFlatShellClassName,
  resolveArrayItemFlatStackPosition,
} from '../../config/array/array-item-flat-shell.lib'
import {
  resolveArrayItemPresentation,
  resolveArrayItemPresentationAnatomy,
} from '../../config/array/array-item-presentation.lib'
import type { ArrayConfig } from '../../field-config'
import { useArrayItemRowState } from './use-array-item-row-state.client'

interface UseArrayFieldItemContentStateArgs {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  legend: string
  variant: 'compact' | 'detailed'
  collapsed: boolean
  fieldsLength: number
  collapsible: boolean
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
    isDragging: boolean
  }
  onRemoveItem?: () => void
}

export function useArrayFieldItemContentState({
  config,
  idPrefix,
  fullName,
  index,
  itemId,
  legend,
  variant,
  collapsed,
  fieldsLength,
  collapsible,
  dragHandleProps,
  onRemoveItem,
}: UseArrayFieldItemContentStateArgs) {
  const headerConfig = resolveArrayItemHeader(config, legend)
  const primaryField = headerConfig.primaryField
  const summaryDependsOn = headerConfig.summaryDependsOn ?? []
  const watchedSummaryContext = useDependsOnValues(summaryDependsOn)
  const watchedPrimary = useWatch({
    name: primaryField ? `${fullName}.${index}.${primaryField}` : `${fullName}.${index}`,
    disabled: !primaryField,
  })
  const itemValues = (useWatch({ name: `${fullName}.${index}` }) ?? {}) as Record<string, unknown>

  const itemConfig = resolveArrayItemConfig(config)
  const rowState = useArrayItemRowState({
    idPrefix,
    fullName,
    index,
    itemId,
    variant,
    collapsed,
    collapsible,
    itemCollapseKey: itemConfig.collapseKey,
    arrayPattern: config.arrayPattern,
    errorPlacement: config.errorPlacement,
    filterSelectDependsOn: config.filterSelect?.dependsOn,
    filterSelectOptions: config.filterSelect?.filter,
    onRemoveItem,
  })

  const header = resolveArrayItemHeaderLabels(
    headerConfig,
    itemValues,
    index,
    watchedPrimary,
    legend,
  )
  const reorder = resolveArrayItemReorder(config)
  const presentation = resolveArrayItemPresentation({
    config,
    variant,
    reorder,
    fieldsLength,
    legend,
    collapsible,
  })
  const anatomy = resolveArrayItemPresentationAnatomy(presentation)
  const reserveDragHandleSlot = presentation.reserveDragHandleSlot
  const sortableEnabled = presentation.sortableEnabled
  const gripVisible = reserveDragHandleSlot && sortableEnabled && Boolean(dragHandleProps)
  const leadingChrome = {
    reserveDragHandleSlot,
    showDragHandle: reserveDragHandleSlot,
    collapsible,
  }
  const rowLabel = header.ariaLabel
  const normalizedContent =
    presentation.contentLayout === 'inline' ? normalizeArrayItemContent(config.fields) : undefined
  const stackPosition = resolveArrayItemFlatStackPosition(index, fieldsLength)
  const shellClassName = resolveArrayItemFlatShellClassName(presentation, stackPosition)

  const chromeProps = {
    titleId: rowState.titleId,
    itemPrefix: rowState.itemPrefix,
    reserveDragHandleSlot,
    gripVisible,
    collapsible,
    dragging: dragHandleProps?.isDragging,
    shellClassName,
  }

  return {
    itemPrefix: rowState.itemPrefix,
    headerConfig,
    watchedSummaryContext,
    watchedPrimary,
    itemValues,
    titleId: rowState.titleId,
    bodyId: rowState.bodyId,
    arrayContext: rowState.arrayContext,
    rowSummaryId: rowState.rowSummaryId,
    suppressFieldErrorText: rowState.suppressFieldErrorText,
    header,
    gripVisible,
    leadingChrome,
    rowLabel,
    focusIssue: rowState.focusIssue,
    badgeProminence: rowState.badgeProminence,
    issueSummary: rowState.issueSummary,
    normalizedContent,
    chromeProps,
    showIssueChrome: rowState.showIssueChrome,
    showIssueBadge: rowState.showIssueBadge,
    issueGroup: rowState.issueGroup,
    itemConfig,
    presentation,
    anatomy,
    reserveDragHandleSlot,
    sortableEnabled,
    shellClassName,
  }
}
