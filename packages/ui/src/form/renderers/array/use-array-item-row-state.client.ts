'use client'

import * as React from 'react'
import { useWatch } from 'react-hook-form'

import type { ArrayConfig, ArrayFilterSelectFn, ArrayItemConfig } from '../../field-config'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { resolveErrorPlacement } from '../../context/array-item-presentation.context'
import {
  useArrayItemIssues,
  useFormValidationPresentation,
} from '../../hooks/use-form-validation-presentation.client'
import { resolveIssueProminence } from '../../errors/resolve-issue-prominence'
import type { FormIssueScope } from '../../errors/form-issue.types'
import { resolveArrayItemIssueSummary } from './array-field-item-issue-summary.lib'
import { useArrayItemFocusIssue } from './use-array-item-focus-issue.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { useFormUiContext } from '../../context/form-ui.context'

export interface UseArrayItemRowStateArgs {
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  variant?: 'compact' | 'detailed'
  collapsed?: boolean
  collapsible?: boolean
  itemCollapseKey?: ArrayItemConfig['collapseKey']
  arrayPattern?: ArrayConfig['arrayPattern']
  errorPlacement?: ArrayConfig['errorPlacement']
  filterSelectDependsOn?: string[]
  filterSelectOptions?: ArrayFilterSelectFn
  onRemoveItem?: () => void
}

export function useArrayItemRowState({
  idPrefix,
  fullName,
  index,
  itemId,
  variant = 'compact',
  collapsed = false,
  collapsible = false,
  itemCollapseKey,
  arrayPattern,
  errorPlacement,
  filterSelectDependsOn,
  filterSelectOptions,
  onRemoveItem,
}: UseArrayItemRowStateArgs) {
  const itemPrefix = `${fullName}.${index}`
  const arrayItems = useWatch({ name: fullName, defaultValue: [] }) as unknown[]
  const itemValues = (useWatch({ name: itemPrefix }) ?? {}) as Record<string, unknown>
  const watchedValues = useDependsOnValues(filterSelectDependsOn ?? [])
  const titleId = `${idPrefix}-${fullName}-${itemId}-title`
  const bodyId = `${idPrefix}-${fullName}-${itemId}-body`
  const rowSummaryId = `${idPrefix}-${itemPrefix.replaceAll('.', '-')}-summary`
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const issueGroup = useArrayItemIssues(fullName, itemPrefix, index)
  const showIssueChrome = validation.shouldShowRowIssues(itemPrefix, issueGroup)
  const suppressFieldErrorText = resolveErrorPlacement(errorPlacement, variant, false)

  const arrayContext = React.useMemo(
    () => ({
      items: arrayItems ?? [],
      rowIndex: index,
      removeItem: onRemoveItem,
      fullArrayName: fullName,
      filterSelectOptions,
      watchedValues,
    }),
    [arrayItems, index, onRemoveItem, fullName, filterSelectOptions, watchedValues],
  )

  const focusIssue = useArrayItemFocusIssue({
    issueGroup,
    collapsible,
    addValidationSessionExpandKeys,
    fullName,
    index,
    itemValues,
    itemPrefix,
    idPrefix,
    itemCollapseKey,
    arrayPattern,
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

  return {
    itemPrefix,
    itemValues,
    titleId,
    bodyId,
    rowSummaryId,
    arrayContext,
    suppressFieldErrorText,
    focusIssue,
    badgeProminence,
    issueSummary: issueSummary as ArrayItemIssueSummaryProps | undefined,
    showIssueChrome,
    issueGroup,
    rowLabel: titleId,
  }
}
