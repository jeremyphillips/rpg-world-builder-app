'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../../context/array-field.context'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../../context/array-item-presentation.context'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type {
  ArrayConfig,
  ArrayItemConfig,
  ArrayItemHeaderConfig,
  RowConfig,
} from '../../field-config'
import { isRowSlotItem } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { NestedFormItems } from '../../containers/form-item-node.client'
import { FieldNode } from '../../containers/form-conditional.client'
import { SlotFormItemSection } from '../fields/slot-field-renderer.client'
import type { ArrayItemIssueProminence } from './array-item-issue.variants'
import { CollapsibleListItem } from '../../../components/ui/collapsible-list-item'
import { DEFAULT_ARRAY_ITEM_SURFACE } from '../../../components/ui/field-dependent.variants'
import { FieldRow } from '../../../components/ui/field-row'
import {
  ArrayItemDragHandle,
  ArrayItemHeaderContent,
  ArrayItemHeaderSummary,
  ArrayItemToolbar,
} from './array-item-header.client'
import { ArrayItemCompactRow } from './array-item-compact-row.client'
import {
  ArrayItemActionsContent,
  ArrayItemActionsRail,
  ArrayItemShell,
} from './array-item-shell.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'
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
  gripVisible: boolean
  collapsible: boolean
  dragging?: boolean
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

interface CompactInlineArrayFieldItemProps extends ArrayFieldItemChromeProps {
  idPrefix: string
  itemPrefix: string
  compactInlineRow: RowConfig
  compactInlineAlign?: ArrayItemConfig['inlineAlign']
  header: ResolvedArrayItemHeader
  suppressFieldErrorText: boolean
  rowSummaryId: string
  arrayContext: React.ComponentProps<typeof ArrayFieldContext.Provider>['value']
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  actionsRail: React.ReactNode
  issueSummary?: ArrayItemIssueSummaryProps
}

function CompactInlineArrayFieldItem({
  titleId,
  itemPrefix,
  gripVisible,
  collapsible,
  dragging,
  idPrefix,
  itemPrefix: namePrefix,
  compactInlineRow,
  compactInlineAlign,
  header,
  suppressFieldErrorText,
  rowSummaryId,
  arrayContext,
  dragHandleProps,
  actionsRail,
  issueSummary,
}: CompactInlineArrayFieldItemProps) {
  const parentContext = useFormSectionContext()
  const rowPresentation = React.useContext(ArrayItemPresentationContext)
  const suppressRowFieldErrorText = resolveErrorPlacement(
    compactInlineRow.errorPlacement,
    'compact',
    true,
  )
  const rowPresentationValue = suppressRowFieldErrorText
    ? { ...rowPresentation, suppressFieldErrorText: true }
    : rowPresentation

  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={gripVisible}
      collapsible={collapsible}
      dragging={dragging}
      layout="compactRow"
      main={
        <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
          <ArrayFieldContext.Provider value={arrayContext}>
            <ArrayItemCompactRow
              titleId={titleId}
              ariaLabel={header.ariaLabel}
              showGrip={gripVisible}
              align={compactInlineAlign}
              grip={
                gripVisible && dragHandleProps ? (
                  <ArrayItemDragHandle
                    ariaLabel={`Drag to reorder ${header.ariaLabel}`}
                    attributes={dragHandleProps.attributes}
                    listeners={dragHandleProps.listeners}
                    compact
                  />
                ) : undefined
              }
              fields={
                <ArrayItemPresentationContext.Provider value={rowPresentationValue}>
                  <FieldRow className={compactInlineRow.className}>
                    {compactInlineRow.fields.map((field) =>
                      isRowSlotItem(field) ? (
                        <SlotFormItemSection
                          key={field.name}
                          item={field}
                          parentContext={parentContext}
                          depth={1}
                          namePrefix={namePrefix}
                        />
                      ) : (
                        <FieldNode
                          key={field.name}
                          config={field}
                          idPrefix={idPrefix}
                          namePrefix={namePrefix}
                        />
                      ),
                    )}
                  </FieldRow>
                </ArrayItemPresentationContext.Provider>
              }
              actions={actionsRail}
              summary={
                issueSummary?.placement === 'compactSummary' ? (
                  <ArrayItemIssueSummary {...issueSummary} />
                ) : undefined
              }
            />
          </ArrayFieldContext.Provider>
        </ArrayItemPresentationContext.Provider>
      }
    />
  )
}

interface CompactToolbarArrayFieldItemProps extends ArrayFieldItemChromeProps {
  legend: string
  index: number
  headerConfig: ArrayItemHeaderConfig
  itemValues: Record<string, unknown>
  watchedPrimary: unknown
  showDragHandle: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  issueSummary?: ArrayItemIssueSummaryProps
  watchedSummaryContext?: Record<string, unknown>
  fieldsNode: React.ReactNode
  actionsRail: React.ReactNode
}

function CompactToolbarArrayFieldItem({
  titleId,
  itemPrefix,
  gripVisible,
  collapsible,
  dragging,
  legend,
  index,
  headerConfig,
  itemValues,
  watchedPrimary,
  showDragHandle,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
  bodyId,
  issueSummary,
  watchedSummaryContext,
  fieldsNode,
  actionsRail,
}: CompactToolbarArrayFieldItemProps) {
  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={gripVisible}
      collapsible={collapsible}
      dragging={dragging}
      main={
        <ArrayItemToolbar
          legend={legend}
          index={index}
          headerConfig={headerConfig}
          itemValues={itemValues}
          watchedPrimary={watchedPrimary}
          watchedSummaryContext={watchedSummaryContext}
          showDragHandle={showDragHandle}
          dragHandleProps={
            dragHandleProps
              ? {
                  ariaLabel: '',
                  attributes: dragHandleProps.attributes,
                  listeners: dragHandleProps.listeners,
                }
              : undefined
          }
          collapsible={collapsible}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          bodyId={bodyId}
          titleId={titleId}
          compact
          issueSummary={issueSummary}
        >
          {fieldsNode}
        </ArrayItemToolbar>
      }
      actions={actionsRail}
    />
  )
}

interface DetailedArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemHeaderConfig
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  showDragHandle: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  leadingChrome: { showDragHandle: boolean; collapsible: boolean }
  actionsRail: React.ReactNode
}

function DetailedArrayFieldItem({
  titleId,
  itemPrefix,
  itemId,
  collapsible,
  dragging,
  header,
  headerConfig,
  itemValues,
  index,
  watchedSummaryContext,
  showDragHandle,
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
  const summary = headerConfig.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
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
      showDragHandle={showDragHandle}
      dragHandleProps={
        dragHandleProps
          ? {
              attributes: dragHandleProps.attributes,
              listeners: dragHandleProps.listeners,
              isDragging: dragHandleProps.isDragging,
            }
          : undefined
      }
      dragging={dragging}
      surface={arrayItemSurface ?? DEFAULT_ARRAY_ITEM_SURFACE}
      tone={arrayItemTone}
      actionsAlign="center"
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={fieldsNode}
      actions={actionsRail}
    />
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
  showDragHandle,
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
    watchedPrimary,
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
    compactInlineRow,
    chromeProps,
    showIssueChrome,
    issueGroup,
    itemConfig,
  } = useArrayFieldItemContentState({
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

  const actionsEmbedded = Boolean(compactInlineRow) || Boolean(itemConfig.renderShell)
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
      bare={variant === 'detailed' && !compactInlineRow && !itemConfig.renderShell}
    />
  )

  if (compactInlineRow) {
    return (
      <CompactInlineArrayFieldItem
        {...chromeProps}
        idPrefix={idPrefix}
        itemPrefix={itemPrefix}
        compactInlineRow={compactInlineRow}
        compactInlineAlign={itemConfig.inlineAlign}
        header={header}
        suppressFieldErrorText={suppressFieldErrorText}
        rowSummaryId={rowSummaryId}
        arrayContext={arrayContext}
        dragHandleProps={dragHandleProps}
        actionsRail={actionsRail}
        issueSummary={issueSummary}
      />
    )
  }

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

  if (variant === 'compact') {
    return (
      <CompactToolbarArrayFieldItem
        {...chromeProps}
        legend={legend}
        index={index}
        headerConfig={headerConfig}
        itemValues={itemValues}
        watchedPrimary={watchedPrimary}
        showDragHandle={showDragHandle}
        dragHandleProps={dragHandleProps}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        bodyId={bodyId}
        issueSummary={issueSummary}
        watchedSummaryContext={watchedSummaryContext}
        fieldsNode={fieldsNode}
        actionsRail={actionsRail}
      />
    )
  }

  return (
    <DetailedArrayFieldItem
      {...chromeProps}
      itemId={itemId}
      header={header}
      headerConfig={headerConfig}
      itemValues={itemValues}
      index={index}
      watchedSummaryContext={watchedSummaryContext}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      bodyId={bodyId}
      issueSummary={issueSummary}
      fieldsNode={fieldsNode}
      leadingChrome={leadingChrome}
      actionsRail={actionsRail}
    />
  )
}
