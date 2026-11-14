'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../../context/array-field.context'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { ArrayConfig } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { ArrayItemActionsContent, ArrayItemActionsRail } from './array-item-shell.client'
import type { SemanticSurfaceTone } from '../../../components/ui/field-surface.variants'
import { buildArrayFieldItemAnatomyProps } from './array-field-item-anatomy-props.lib'
import { renderArrayFieldItemByAnatomy } from './array-field-item-content-anatomy.client'
import { renderArrayFieldItemFieldsNode } from './array-field-item-fields-node.client'
import { useArrayFieldItemContentState } from './use-array-field-item-content-state.client'

export interface ArrayFieldItemContentProps {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  legend: string
  itemBodyStackClasses: string
  canRemove: boolean
  showDefaultItemRemove: boolean
  showDragHandle: boolean
  fieldsLength: number
  collapsible: boolean
  variant: 'compact' | 'detailed'
  collapsed: boolean
  onToggleCollapse: () => void
  onRemove: () => void
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
    isDragging: boolean
  }
}

interface ArrayFieldItemActionsRailProps {
  header: ResolvedArrayItemHeader
  canRemove: boolean
  showDefaultItemRemove: boolean
  customRemove?: React.ReactNode
  beforeRemove?: React.ReactNode
  onRemove: () => void
  showIssueBadge: boolean
  issueCount: number
  rowLabel: string
  onFocusIssue: () => void
  variant: 'compact' | 'detailed'
  embedded: boolean
}

function ArrayFieldItemActionsRailSlot({
  header,
  canRemove,
  showDefaultItemRemove,
  customRemove,
  beforeRemove,
  onRemove,
  showIssueBadge,
  issueCount,
  rowLabel,
  onFocusIssue,
  variant,
  embedded,
  bare = false,
}: ArrayFieldItemActionsRailProps & { bare?: boolean }) {
  const contentProps = {
    removeAriaLabel: `Remove ${header.ariaLabel}`,
    canRemove,
    showDefaultRemove: showDefaultItemRemove,
    customRemove,
    beforeRemove,
    onRemove,
    issueCount: showIssueBadge ? issueCount : 0,
    issueRowLabel: rowLabel,
    onIssuePress: onFocusIssue,
    compact: variant === 'compact',
  }

  if (bare) {
    return <ArrayItemActionsContent {...contentProps} />
  }

  return <ArrayItemActionsRail {...contentProps} embedded={embedded} />
}

function resolveArrayItemShellTone(
  sectionTone: SemanticSurfaceTone | undefined,
  showRowInvalidBorder: boolean,
): SemanticSurfaceTone | undefined {
  if (showRowInvalidBorder) return 'destructive'
  return sectionTone
}

function renderArrayItemUtilitySlot(
  slot: { render: () => React.ReactNode } | undefined,
  arrayContext: React.ComponentProps<typeof ArrayFieldContext.Provider>['value'],
): React.ReactNode {
  if (!slot) return undefined
  return (
    <ArrayFieldContext.Provider value={arrayContext}>{slot.render()}</ArrayFieldContext.Provider>
  )
}

export function ArrayFieldItemContent({
  config,
  idPrefix,
  fullName,
  index,
  itemId,
  legend,
  itemBodyStackClasses,
  canRemove,
  showDefaultItemRemove,
  showDragHandle: _showDragHandle,
  fieldsLength,
  collapsible,
  variant,
  collapsed,
  onToggleCollapse,
  onRemove,
  dragHandleProps,
}: ArrayFieldItemContentProps) {
  const parentContext = useFormSectionContext()
  const arrayItemFieldContext = React.useMemo(
    () => ({ ...parentContext, surfaceHost: 'array-item' as const }),
    [parentContext],
  )
  const {
    itemPrefix,
    headerConfig,
    watchedSummaryContext,
    itemValues,
    bodyId,
    arrayContext,
    rowSummaryId,
    suppressFieldErrorText,
    header,
    leadingChrome,
    rowLabel,
    focusIssue,
    issueSummaries,
    validationPresentation,
    fieldJoinSummaryId,
    normalizedContent,
    chromeProps,
    showIssueBadge,
    issueGroup,
    itemConfig,
    anatomy,
    sortableEnabled,
    presentation,
  } = useArrayFieldItemContentState({
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
    onRemoveItem: onRemove,
  })

  const shellTone = resolveArrayItemShellTone(
    parentContext.arrayItemTone,
    validationPresentation.showRowInvalidBorder,
  )
  const presentationRowSummaryId =
    suppressFieldErrorText && validationPresentation.fieldJoin ? fieldJoinSummaryId : rowSummaryId

  const { fieldsNode, itemBody } = renderArrayFieldItemFieldsNode({
    config,
    idPrefix,
    itemPrefix,
    itemBodyStackClasses,
    suppressFieldErrorText,
    presentationRowSummaryId,
    arrayContext,
    arrayItemFieldContext,
    itemValues,
  })

  const customRemove = renderArrayItemUtilitySlot(itemConfig.removeSlot, arrayContext)
  const beforeRemove = renderArrayItemUtilitySlot(itemConfig.beforeRemove, arrayContext)

  const actionsEmbedded = anatomy === 'flatNoHeader' || Boolean(itemConfig.renderShell)
  const actionsRail = (
    <ArrayFieldItemActionsRailSlot
      header={header}
      canRemove={canRemove}
      showDefaultItemRemove={showDefaultItemRemove}
      customRemove={customRemove}
      beforeRemove={beforeRemove}
      onRemove={onRemove}
      showIssueBadge={showIssueBadge}
      issueCount={issueGroup.totalCount}
      rowLabel={rowLabel}
      onFocusIssue={focusIssue}
      variant={variant}
      embedded={actionsEmbedded}
      bare={(anatomy === 'disclosure' || anatomy === 'flatWithHeader') && !itemConfig.renderShell}
    />
  )

  if (itemConfig.renderShell) {
    const summary = headerConfig.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
    return itemConfig.renderShell({
      itemId,
      itemPrefix,
      titleId: chromeProps.titleId,
      index,
      header,
      itemValues,
      summary: summary || undefined,
      collapsed,
      onToggleCollapse,
      dragHandleProps,
      action: actionsRail,
      children: fieldsNode,
    })
  }

  return renderArrayFieldItemByAnatomy(
    anatomy,
    buildArrayFieldItemAnatomyProps({
      idPrefix,
      itemPrefix,
      index,
      itemId,
      chromeProps,
      presentation,
      normalizedContent,
      header,
      headerConfig,
      itemValues,
      watchedSummaryContext,
      sortableEnabled,
      dragHandleProps,
      issueSummaries,
      shellTone,
      itemBody,
      fieldsNode,
      actionsRail,
      collapsed,
      onToggleCollapse,
      bodyId,
      leadingChrome,
      suppressFieldErrorText,
      rowSummaryId,
      arrayContext,
    }),
  )
}
