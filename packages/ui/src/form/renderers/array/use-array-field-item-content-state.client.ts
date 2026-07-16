'use client'

import { useWatch } from 'react-hook-form'
import type { useSortable } from '@dnd-kit/sortable'

import { useDependsOnValues } from '../../config/form-depends-on.client'
import {
  resolveArrayItemHeader,
  resolveArrayItemHeaderLabels,
  resolveCompactInlineRow,
} from '../../config/array/array-item-config.lib'
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
  showDragHandle: boolean
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
  showDragHandle,
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

  const rowState = useArrayItemRowState({
    idPrefix,
    fullName,
    index,
    itemId,
    variant,
    collapsed,
    collapsible,
    itemCollapseKey: config.itemCollapseKey,
    arrayPattern: config.arrayPattern,
    errorPlacement: config.errorPlacement,
    filterSelectDependsOn: config.filterSelectDependsOn,
    filterSelectOptions: config.filterSelectOptions,
    onRemoveItem,
  })

  const header = resolveArrayItemHeaderLabels(
    headerConfig,
    itemValues,
    index,
    watchedPrimary,
    legend,
  )
  const gripVisible = showDragHandle && Boolean(dragHandleProps)
  const leadingChrome = { showDragHandle: gripVisible, collapsible }
  const rowLabel = header.ariaLabel
  const compactInlineRow =
    variant === 'compact' ? resolveCompactInlineRow(config.fields) : undefined

  const chromeProps = {
    titleId: rowState.titleId,
    itemPrefix: rowState.itemPrefix,
    gripVisible,
    collapsible,
    dragging: dragHandleProps?.isDragging,
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
    compactInlineRow,
    chromeProps,
    showIssueChrome: rowState.showIssueChrome,
    issueGroup: rowState.issueGroup,
  }
}
