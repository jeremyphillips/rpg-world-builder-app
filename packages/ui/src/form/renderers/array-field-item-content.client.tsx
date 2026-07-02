'use client'

import * as React from 'react'
import { useWatch } from 'react-hook-form'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../context/array-field.context'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../context/array-item-presentation.context'
import { useDependsOnValues } from '../config/form-depends-on.client'
import {
  resolveArrayItemHeader,
  resolveArrayItemHeaderLabels,
  resolveCompactInlineRow,
  type ResolvedArrayItemHeader,
} from '../config/array-item-config.lib'
import type { ArrayConfig, RowConfig } from '../field-config'
import { NestedFormItems } from '../containers/form-item-node.client'
import { FieldNode } from '../containers/form-conditional.client'
import {
  useArrayItemIssues,
  useFormValidationPresentation,
} from '../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../context/form-ui.context'
import { resolveIssueProminence } from '../errors/resolve-issue-prominence'
import type { FormIssueScope } from '../errors/form-issue.types'
import { ArrayItemToolbar, ArrayItemDragHandle } from './array-item-header.client'
import { ArrayItemCompactRow } from './array-item-compact-row.client'
import { ArrayItemActionsRail, ArrayItemShell } from './array-item-shell.client'
import { arrayItemBodyClasses } from './array-item-toolbar.variants'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'
import { resolveArrayItemIssueSummary } from './array-field-item-issue-summary.lib'
import { useArrayItemFocusIssue } from './use-array-item-focus-issue.client'
import { resolveLevelRangeKeys } from './array-field-renderer.lib'

export interface ArrayFieldItemContentProps {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  legend: string
  itemBodyStackClasses: string
  canRemove: boolean
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
  onRemove: () => void
  showIssueChrome: boolean
  issueCount: number
  rowLabel: string
  onFocusIssue: () => void
  badgeProminence: ReturnType<typeof resolveIssueProminence>
  variant: 'compact' | 'detailed'
  embedded: boolean
}

function ArrayFieldItemActionsRailSlot({
  header,
  canRemove,
  onRemove,
  showIssueChrome,
  issueCount,
  rowLabel,
  onFocusIssue,
  badgeProminence,
  variant,
  embedded,
}: ArrayFieldItemActionsRailProps) {
  return (
    <ArrayItemActionsRail
      removeAriaLabel={`Remove ${header.ariaLabel}`}
      canRemove={canRemove}
      onRemove={onRemove}
      issueCount={showIssueChrome ? issueCount : 0}
      issueRowLabel={rowLabel}
      onIssuePress={onFocusIssue}
      badgeProminence={showIssueChrome ? badgeProminence : 'nav'}
      compact={variant === 'compact'}
      embedded={embedded}
    />
  )
}

interface CompactInlineArrayFieldItemProps extends ArrayFieldItemChromeProps {
  idPrefix: string
  itemPrefix: string
  compactInlineRow: RowConfig
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
  header,
  suppressFieldErrorText,
  rowSummaryId,
  arrayContext,
  dragHandleProps,
  actionsRail,
  issueSummary,
}: CompactInlineArrayFieldItemProps) {
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
              fieldCount={compactInlineRow.fields.length}
              showGrip={gripVisible}
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
              fields={compactInlineRow.fields.map((field) => (
                <FieldNode
                  key={field.name}
                  config={field}
                  idPrefix={idPrefix}
                  namePrefix={namePrefix}
                />
              ))}
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

interface ToolbarArrayFieldItemProps extends ArrayFieldItemChromeProps {
  legend: string
  index: number
  headerConfig: ReturnType<typeof resolveArrayItemHeader>
  itemValues: Record<string, unknown>
  watchedPrimary: unknown
  showDragHandle: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  variant: 'compact' | 'detailed'
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  leadingChrome: { showDragHandle: boolean; collapsible: boolean }
  actionsRail: React.ReactNode
}

function ToolbarArrayFieldItem({
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
  variant,
  issueSummary,
  fieldsNode,
  leadingChrome,
  actionsRail,
}: ToolbarArrayFieldItemProps) {
  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={gripVisible}
      collapsible={collapsible}
      dragging={dragging}
      main={
        <>
          <ArrayItemToolbar
            legend={legend}
            index={index}
            headerConfig={headerConfig}
            itemValues={itemValues}
            watchedPrimary={watchedPrimary}
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
            compact={variant === 'compact'}
            issueSummary={issueSummary}
          >
            {variant === 'compact' ? fieldsNode : null}
          </ArrayItemToolbar>
          {variant === 'detailed' ? (
            <div
              id={bodyId}
              hidden={collapsed || undefined}
              className={arrayItemBodyClasses(leadingChrome)}
              aria-hidden={collapsed}
            >
              {fieldsNode}
            </div>
          ) : null}
        </>
      }
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
  showDragHandle,
  collapsible,
  variant,
  collapsed,
  onToggleCollapse,
  onRemove,
  dragHandleProps,
}: ArrayFieldItemContentProps) {
  const itemPrefix = `${fullName}.${index}`
  const headerConfig = resolveArrayItemHeader(config, legend)
  const primaryField = headerConfig.primaryField
  const watchedPrimary = useWatch({
    name: primaryField ? `${itemPrefix}.${primaryField}` : `${itemPrefix}`,
    disabled: !primaryField,
  })
  const itemValues = (useWatch({ name: itemPrefix }) ?? {}) as Record<string, unknown>
  const arrayItems = useWatch({ name: fullName, defaultValue: [] }) as unknown[]
  const watchedValues = useDependsOnValues(config.filterSelectDependsOn ?? [])
  const arrayItemsSignature = React.useMemo(() => JSON.stringify(arrayItems ?? []), [arrayItems])
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
      fullArrayName: levelRangeKeys ? fullName : undefined,
      levelRangeKeys,
      filterSelectOptions: config.filterSelectOptions,
      watchedValues,
    }),
    [
      arrayItems,
      arrayItemsSignature,
      index,
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

  const chromeProps = {
    titleId,
    itemPrefix,
    gripVisible,
    collapsible,
    dragging: dragHandleProps?.isDragging,
  }

  const actionsRail = (
    <ArrayFieldItemActionsRailSlot
      header={header}
      canRemove={canRemove}
      onRemove={onRemove}
      showIssueChrome={showIssueChrome}
      issueCount={issueGroup.totalCount}
      rowLabel={rowLabel}
      onFocusIssue={focusIssue}
      badgeProminence={badgeProminence}
      variant={variant}
      embedded={Boolean(compactInlineRow)}
    />
  )

  if (compactInlineRow) {
    return (
      <CompactInlineArrayFieldItem
        {...chromeProps}
        idPrefix={idPrefix}
        itemPrefix={itemPrefix}
        compactInlineRow={compactInlineRow}
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

  return (
    <ToolbarArrayFieldItem
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
      variant={variant}
      issueSummary={issueSummary}
      fieldsNode={fieldsNode}
      leadingChrome={leadingChrome}
      actionsRail={actionsRail}
    />
  )
}
