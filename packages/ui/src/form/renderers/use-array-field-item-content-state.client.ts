'use client'

import * as React from 'react'
import { useWatch } from 'react-hook-form'
import type { useSortable } from '@dnd-kit/sortable'

import { useDependsOnValues } from '../config/form-depends-on.client'
import {
  resolveArrayItemHeader,
  resolveArrayItemHeaderLabels,
  resolveCompactInlineRow,
} from '../config/array-item-config.lib'
import type { ArrayConfig } from '../field-config'
import { resolveErrorPlacement } from '../context/array-item-presentation.context'
import {
  useArrayItemIssues,
  useFormValidationPresentation,
} from '../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../context/form-ui.context'
import { resolveIssueProminence } from '../errors/resolve-issue-prominence'
import type { FormIssueScope } from '../errors/form-issue.types'
import { resolveArrayItemIssueSummary } from './array-field-item-issue-summary.lib'
import { useArrayItemFocusIssue } from './use-array-item-focus-issue.client'
import { resolveLevelRangeKeys } from './array-field-renderer.lib'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'

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
  const itemPrefix = `${fullName}.${index}`
  const headerConfig = resolveArrayItemHeader(config, legend)
  const primaryField = headerConfig.primaryField
  const summaryDependsOn = headerConfig.summaryDependsOn ?? []
  const watchedSummaryContext = useDependsOnValues(summaryDependsOn)
  const watchedPrimary = useWatch({
    name: primaryField ? `${itemPrefix}.${primaryField}` : `${itemPrefix}`,
    disabled: !primaryField,
  })
  const itemValues = (useWatch({ name: itemPrefix }) ?? {}) as Record<string, unknown>
  const arrayItems = useWatch({ name: fullName, defaultValue: [] }) as unknown[]
  const watchedValues = useDependsOnValues(config.filterSelectDependsOn ?? [])
  const titleId = `${idPrefix}-${fullName}-${itemId}-title`
  const bodyId = `${idPrefix}-${fullName}-${itemId}-body`
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const issueGroup = useArrayItemIssues(fullName, itemPrefix, index)
  const showIssueChrome = validation.shouldShowRowIssues(itemPrefix, issueGroup)

  const levelRangeKeys = React.useMemo(
    () => resolveLevelRangeKeys(config.arrayPattern),
    [config.arrayPattern],
  )

  const arrayContext = React.useMemo(
    () => ({
      items: arrayItems ?? [],
      rowIndex: index,
      removeItem: onRemoveItem,
      fullArrayName: levelRangeKeys ? fullName : undefined,
      levelRangeKeys,
      filterSelectOptions: config.filterSelectOptions,
      watchedValues,
    }),
    [
      arrayItems,
      index,
      onRemoveItem,
      fullName,
      levelRangeKeys,
      config.filterSelectOptions,
      watchedValues,
    ],
  )

  const rowSummaryId = `${idPrefix}-${itemPrefix.replaceAll('.', '-')}-summary`
  const suppressFieldErrorText = resolveErrorPlacement(config.errorPlacement, variant, false)
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

  const focusIssue = useArrayItemFocusIssue({
    issueGroup,
    collapsible,
    addValidationSessionExpandKeys,
    fullName,
    index,
    itemValues,
    itemPrefix,
    idPrefix,
    itemCollapseKey: config.itemCollapseKey,
    arrayPattern: config.arrayPattern,
  })

  const issueScope: FormIssueScope = variant === 'compact' ? 'field' : 'item'
  const issueVisibility = variant === 'compact' || !collapsed ? 'visible' : 'collapsed'
  const badgeProminence = resolveIssueProminence(issueScope, issueVisibility)
  const issueSummary = resolveArrayItemIssueSummary({
    showIssueChrome,
    variant,
    collapsed,
    issueGroup,
    rowSummaryId,
    onFocusIssue: focusIssue,
  })
  const compactInlineRow =
    variant === 'compact' ? resolveCompactInlineRow(config.fields) : undefined

  const chromeProps = {
    titleId,
    itemPrefix,
    gripVisible,
    collapsible,
    dragging: dragHandleProps?.isDragging,
  }

  return {
    itemPrefix,
    headerConfig,
    watchedSummaryContext,
    watchedPrimary,
    itemValues,
    titleId,
    bodyId,
    arrayContext,
    rowSummaryId,
    suppressFieldErrorText,
    header,
    gripVisible,
    leadingChrome,
    rowLabel,
    focusIssue,
    badgeProminence,
    issueSummary: issueSummary as ArrayItemIssueSummaryProps | undefined,
    compactInlineRow,
    chromeProps,
    showIssueChrome,
    issueGroup,
  }
}
