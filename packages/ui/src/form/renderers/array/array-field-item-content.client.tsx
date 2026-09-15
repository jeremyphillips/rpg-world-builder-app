'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../../context/array-field.context'
import { ArrayItemPresentationContext } from '../../context/array-item-presentation.context'
import type { ArrayItemPresentationAnatomy } from '../../config/array/array-item-presentation.lib'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { ArrayConfig, ArrayItemConfig } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { NestedFormItems } from '../../containers/form-item-node.client'
import type { ArrayItemIssueProminence } from './array-item-issue.variants'
import { CollapsibleListItem } from '../../../components/ui/collapsible-list-item'
import { resolveArrayItemShellSurface } from '../../config/array/resolve-array-item-shell-surface.lib'
import { ArrayItemHeaderContent, ArrayItemHeaderSummary } from './array-item-header.client'
import { ArrayItemActionsContent, ArrayItemActionsRail } from './array-item-shell.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { FlatNoHeaderArrayFieldItem } from './flat-no-header-array-field-item.client'
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

interface ArrayFieldItemChromeProps {
  titleId: string
  itemPrefix: string
  reserveDragHandleSlot: boolean
  gripVisible: boolean
  collapsible: boolean
  dragging?: boolean
  shellClassName?: string
}

interface ArrayFieldItemActionsRailProps {
  header: ResolvedArrayItemHeader
  canRemove: boolean
  showDefaultItemRemove: boolean
  customRemove?: React.ReactNode
  onRemove: () => void
  showIssueChrome: boolean
  issueCount: number
  rowLabel: string
  onFocusIssue: () => void
  badgeProminence: ArrayItemIssueProminence
  variant: 'compact' | 'detailed'
  embedded: boolean
}

function ArrayFieldItemActionsRailSlot({
  header,
  canRemove,
  showDefaultItemRemove,
  customRemove,
  onRemove,
  showIssueChrome,
  issueCount,
  rowLabel,
  onFocusIssue,
  badgeProminence,
  variant,
  embedded,
  bare = false,
}: ArrayFieldItemActionsRailProps & { bare?: boolean }) {
  const contentProps = {
    removeAriaLabel: `Remove ${header.ariaLabel}`,
    canRemove,
    showDefaultRemove: showDefaultItemRemove,
    customRemove,
    onRemove,
    issueCount: showIssueChrome ? issueCount : 0,
    issueRowLabel: rowLabel,
    onIssuePress: onFocusIssue,
    badgeProminence: showIssueChrome ? badgeProminence : 'nav',
    compact: variant === 'compact',
  }

  if (bare) {
    return <ArrayItemActionsContent {...contentProps} />
  }

  return <ArrayItemActionsRail {...contentProps} embedded={embedded} />
}

interface FlatLabeledArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  actionsRail: React.ReactNode
}

function FlatLabeledArrayFieldItem({
  titleId,
  itemPrefix,
  itemId,
  reserveDragHandleSlot,
  dragging,
  shellClassName,
  header,
  headerConfig,
  itemValues,
  index,
  watchedSummaryContext,
  sortableEnabled,
  dragHandleProps,
  issueSummary,
  fieldsNode,
  actionsRail,
}: FlatLabeledArrayFieldItemProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const summary = headerConfig?.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
  const summaryNode =
    summary || issueSummary ? (
      <ArrayItemHeaderSummary
        summary={summary}
        issueSummary={issueSummary}
        collapsed={false}
        leadingChrome={{
          reserveDragHandleSlot,
          showDragHandle: reserveDragHandleSlot,
          collapsible: false,
        }}
      />
    ) : undefined

  return (
    <CollapsibleListItem
      itemId={itemId}
      titleId={titleId}
      itemPrefix={itemPrefix}
      toolbarAriaLabel={header.ariaLabel}
      collapsible={false}
      collapsed={false}
      showDragHandle={reserveDragHandleSlot}
      dragHandleProps={
        sortableEnabled && dragHandleProps
          ? {
              attributes: dragHandleProps.attributes,
              listeners: dragHandleProps.listeners,
              isDragging: dragHandleProps.isDragging,
            }
          : undefined
      }
      dragging={dragging}
      surface={resolveArrayItemShellSurface({
        explicit: arrayItemSurface,
        collapsible: false,
      })}
      tone={arrayItemTone}
      actionsAlign="center"
      className={shellClassName}
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={fieldsNode}
      actions={actionsRail}
    />
  )
}

interface DetailedArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  leadingChrome: { reserveDragHandleSlot: boolean; showDragHandle: boolean; collapsible: boolean }
  actionsRail: React.ReactNode
}

function DetailedArrayFieldItem({
  titleId,
  itemPrefix,
  itemId,
  reserveDragHandleSlot,
  collapsible,
  dragging,
  header,
  headerConfig,
  itemValues,
  index,
  watchedSummaryContext,
  sortableEnabled,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
  bodyId,
  issueSummary,
  fieldsNode,
  leadingChrome,
  actionsRail,
}: DetailedArrayFieldItemProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const summary = headerConfig?.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
  const summaryNode =
    summary || issueSummary ? (
      <ArrayItemHeaderSummary
        summary={summary}
        issueSummary={issueSummary}
        collapsed={collapsed}
        leadingChrome={leadingChrome}
      />
    ) : undefined

  return (
    <CollapsibleListItem
      itemId={itemId}
      titleId={titleId}
      bodyId={bodyId}
      itemPrefix={itemPrefix}
      toolbarAriaLabel={header.ariaLabel}
      collapsible={collapsible}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      showDragHandle={reserveDragHandleSlot}
      dragHandleProps={
        sortableEnabled && dragHandleProps
          ? {
              attributes: dragHandleProps.attributes,
              listeners: dragHandleProps.listeners,
              isDragging: dragHandleProps.isDragging,
            }
          : undefined
      }
      dragging={dragging}
      surface={resolveArrayItemShellSurface({
        explicit: arrayItemSurface,
        collapsible,
      })}
      tone={arrayItemTone}
      actionsAlign="center"
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={fieldsNode}
      actions={actionsRail}
    />
  )
}

function renderArrayFieldItemByAnatomy(
  anatomy: ArrayItemPresentationAnatomy,
  props: {
    flatNoHeader: React.ComponentProps<typeof FlatNoHeaderArrayFieldItem>
    flatWithHeader: FlatLabeledArrayFieldItemProps
    disclosure: DetailedArrayFieldItemProps
  },
) {
  switch (anatomy) {
    case 'flatNoHeader':
      return <FlatNoHeaderArrayFieldItem {...props.flatNoHeader} />
    case 'flatWithHeader':
      return <FlatLabeledArrayFieldItem {...props.flatWithHeader} />
    case 'disclosure':
      return <DetailedArrayFieldItem {...props.disclosure} />
    default:
      return null
  }
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
    badgeProminence,
    issueSummary,
    normalizedContent,
    chromeProps,
    showIssueChrome,
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

  const fieldsNode = (
    <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
      <ArrayFieldContext.Provider value={arrayContext}>
        <div className={itemBodyStackClasses}>
          <NestedFormItems
            items={config.fields}
            idPrefix={idPrefix}
            namePrefix={itemPrefix}
            depth={1}
          />
        </div>
      </ArrayFieldContext.Provider>
    </ArrayItemPresentationContext.Provider>
  )

  const customRemove = itemConfig.removeSlot ? (
    <ArrayFieldContext.Provider value={arrayContext}>
      {itemConfig.removeSlot.render()}
    </ArrayFieldContext.Provider>
  ) : undefined

  const compactInlineAlign = itemConfig.inlineAlign
  const actionsEmbedded = anatomy === 'flatNoHeader' || Boolean(itemConfig.renderShell)
  const actionsRail = (
    <ArrayFieldItemActionsRailSlot
      header={header}
      canRemove={canRemove}
      showDefaultItemRemove={showDefaultItemRemove}
      customRemove={customRemove}
      onRemove={onRemove}
      showIssueChrome={showIssueChrome}
      issueCount={issueGroup.totalCount}
      rowLabel={rowLabel}
      onFocusIssue={focusIssue}
      badgeProminence={badgeProminence}
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

  return renderArrayFieldItemByAnatomy(anatomy, {
    flatNoHeader: {
      ...chromeProps,
      idPrefix,
      itemPrefix,
      contentLayout: presentation.contentLayout,
      inlineFields: normalizedContent?.inlineFields,
      inlineRow: normalizedContent?.inlineRow,
      compactInlineAlign,
      header,
      sortableEnabled,
      suppressFieldErrorText,
      rowSummaryId,
      arrayContext,
      dragHandleProps,
      issueSummary,
      fieldsNode,
      actionsRail,
    },
    flatWithHeader: {
      ...chromeProps,
      itemId,
      header,
      headerConfig,
      itemValues,
      index,
      watchedSummaryContext,
      sortableEnabled,
      dragHandleProps,
      issueSummary,
      fieldsNode,
      actionsRail,
    },
    disclosure: {
      ...chromeProps,
      itemId,
      header,
      headerConfig,
      itemValues,
      index,
      watchedSummaryContext,
      sortableEnabled,
      dragHandleProps,
      collapsed,
      onToggleCollapse,
      bodyId,
      issueSummary,
      fieldsNode,
      leadingChrome,
      actionsRail,
    },
  })
}
