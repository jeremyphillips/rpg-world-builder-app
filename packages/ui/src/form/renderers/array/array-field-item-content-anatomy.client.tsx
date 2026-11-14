'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { CollapsibleListItem } from '../../../components/ui/collapsible-list-item'
import type { SemanticSurfaceTone } from '../../../components/ui/field-surface.variants'
import type { ArrayItemPresentationAnatomy } from '../../config/array/array-item-presentation.lib'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import { resolveArrayItemShellSurface } from '../../config/array/resolve-array-item-shell-surface.lib'
import type { ArrayItemConfig } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { ArrayItemHeaderContent, ArrayItemHeaderSummary } from './array-item-header.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { FlatNoHeaderArrayFieldItem } from './flat-no-header-array-field-item.client'

export interface ArrayFieldItemChromeProps {
  titleId: string
  itemPrefix: string
  reserveDragHandleSlot: boolean
  gripVisible: boolean
  collapsible: boolean
  dragging?: boolean
  shellClassName?: string
}

type ArrayFieldItemDragHandleProps = {
  attributes: ReturnType<typeof useSortable>['attributes']
  listeners: ReturnType<typeof useSortable>['listeners']
  isDragging: boolean
}

export interface FlatLabeledArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps?: ArrayFieldItemDragHandleProps
  issueSummaries?: readonly ArrayItemIssueSummaryProps[]
  shellTone?: SemanticSurfaceTone
  itemBody?: React.ReactNode
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
  issueSummaries,
  shellTone,
  itemBody,
  actionsRail,
}: FlatLabeledArrayFieldItemProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const summary = headerConfig?.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
  const summaryNode =
    summary || issueSummaries?.length ? (
      <ArrayItemHeaderSummary
        summary={summary}
        issueSummaries={issueSummaries}
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
        hasItemHeader: true,
      })}
      tone={shellTone ?? arrayItemTone}
      className={shellClassName}
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={itemBody}
      actions={actionsRail}
    />
  )
}

export interface DetailedArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps?: ArrayFieldItemDragHandleProps
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  issueSummaries?: readonly ArrayItemIssueSummaryProps[]
  shellTone?: SemanticSurfaceTone
  itemBody?: React.ReactNode
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
  issueSummaries,
  shellTone,
  itemBody,
  leadingChrome,
  actionsRail,
}: DetailedArrayFieldItemProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const summary = headerConfig?.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
  const summaryNode =
    summary || issueSummaries?.length ? (
      <ArrayItemHeaderSummary
        summary={summary}
        issueSummaries={issueSummaries}
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
      tone={shellTone ?? arrayItemTone}
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={itemBody}
      actions={actionsRail}
    />
  )
}

export function renderArrayFieldItemByAnatomy(
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
