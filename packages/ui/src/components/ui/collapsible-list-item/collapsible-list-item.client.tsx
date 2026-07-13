'use client'

import * as React from 'react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import { cn } from '../../../lib/utils'
import { CollapsibleListItemActions } from './collapsible-list-item-actions.client'
import {
  CollapsibleListItemShell,
  type CollapsibleListItemActionsAlign,
  type CollapsibleListItemShellTone,
} from './collapsible-list-item-shell.client'
import {
  CollapsibleListItemCollapseButton,
  CollapsibleListItemDragHandle,
  CollapsibleListItemToolbar,
  type CollapsibleListItemDragHandleProps,
} from './collapsible-list-item-toolbar.client'
import {
  collapsibleListItemBodyClasses,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item.variants'

export type CollapsibleListItemDragHandleConfig = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  isDragging?: boolean
}

export interface CollapsibleListItemProps {
  itemId: string
  titleId: string
  toolbarAriaLabel: string
  collapsible?: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  showDragHandle?: boolean
  dragHandleProps?: CollapsibleListItemDragHandleConfig
  tone?: CollapsibleListItemShellTone
  layout?: 'default' | 'compactRow'
  actionsAlign?: CollapsibleListItemActionsAlign
  toolbarCompact?: boolean
  bodyClassName?: string
  dragging?: boolean
  itemPrefix?: string
  className?: string
  header: React.ReactNode
  summary?: React.ReactNode
  body?: React.ReactNode
  bodyId?: string
  actions?: React.ReactNode
}

interface CollapsibleListItemContextValue {
  itemId: string
  titleId: string
  bodyId: string
  toolbarAriaLabel: string
  leadingChrome: CollapsibleListItemLeadingChromeOptions
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  gripVisible: boolean
  dragHandleProps?: CollapsibleListItemDragHandleProps
  tone: CollapsibleListItemShellTone
  layout: 'default' | 'compactRow'
  dragging: boolean
  itemPrefix?: string
  className?: string
}

const CollapsibleListItemContext = React.createContext<CollapsibleListItemContextValue | null>(null)

function useCollapsibleListItemContext(component: string): CollapsibleListItemContextValue {
  const context = React.useContext(CollapsibleListItemContext)
  if (!context) {
    throw new Error(`${component} must be used within CollapsibleListItem.Root`)
  }
  return context
}

function resolveBodyId(itemId: string, bodyId?: string): string {
  return bodyId ?? `${itemId}-body`
}

function CollapsibleListItemRoot({
  itemId,
  titleId,
  toolbarAriaLabel,
  collapsible = false,
  collapsed,
  onToggleCollapse,
  showDragHandle = false,
  dragHandleProps,
  tone = 'default',
  layout = 'default',
  actionsAlign: actionsAlignProp,
  toolbarCompact = false,
  bodyClassName,
  dragging = false,
  itemPrefix,
  className,
  header,
  summary,
  body,
  bodyId,
  actions,
}: CollapsibleListItemProps) {
  const resolvedBodyId = resolveBodyId(itemId, bodyId)
  const gripVisible = showDragHandle && Boolean(dragHandleProps)
  const actionsAlign =
    actionsAlignProp ?? (gripVisible || layout === 'compactRow' ? 'start' : 'center')
  const leadingChrome: CollapsibleListItemLeadingChromeOptions = {
    showDragHandle: gripVisible,
    collapsible,
  }

  const resolvedDragHandleProps = dragHandleProps
    ? {
        ariaLabel: `Drag to reorder ${toolbarAriaLabel}`,
        attributes: dragHandleProps.attributes,
        listeners: dragHandleProps.listeners,
      }
    : undefined

  const contextValue = React.useMemo(
    (): CollapsibleListItemContextValue => ({
      itemId,
      titleId,
      bodyId: resolvedBodyId,
      toolbarAriaLabel,
      leadingChrome,
      collapsible,
      collapsed,
      onToggleCollapse,
      gripVisible,
      dragHandleProps: resolvedDragHandleProps,
      tone,
      layout,
      dragging: dragging || Boolean(dragHandleProps?.isDragging),
      itemPrefix,
      className,
    }),
    [
      itemId,
      titleId,
      resolvedBodyId,
      toolbarAriaLabel,
      leadingChrome,
      collapsible,
      collapsed,
      onToggleCollapse,
      gripVisible,
      resolvedDragHandleProps,
      tone,
      layout,
      dragging,
      dragHandleProps?.isDragging,
      itemPrefix,
      className,
    ],
  )

  return (
    <CollapsibleListItemContext.Provider value={contextValue}>
      <CollapsibleListItemShell
        titleId={titleId}
        itemPrefix={itemPrefix}
        showDragHandle={gripVisible}
        collapsible={collapsible}
        dragging={contextValue.dragging}
        layout={layout}
        actionsAlign={actionsAlign}
        tone={tone}
        className={className}
        toolbar={
          <CollapsibleListItemToolbar
            titleId={titleId}
            toolbarAriaLabel={toolbarAriaLabel}
            leadingChrome={leadingChrome}
            gripVisible={gripVisible}
            dragHandleProps={resolvedDragHandleProps}
            collapsible={collapsible}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            bodyId={resolvedBodyId}
            compact={toolbarCompact}
            header={header}
            summary={actionsAlign === 'center' ? undefined : summary}
          />
        }
        summary={actionsAlign === 'center' ? summary : undefined}
        body={
          body ? (
            <CollapsibleListItemBody
              bodyId={resolvedBodyId}
              hidden={collapsed}
              className={cn(collapsibleListItemBodyClasses(leadingChrome), bodyClassName)}
            >
              {body}
            </CollapsibleListItemBody>
          ) : undefined
        }
        actions={actions}
      />
    </CollapsibleListItemContext.Provider>
  )
}

function CollapsibleListItemCompoundRoot({
  children,
  actions,
  ...props
}: Omit<CollapsibleListItemProps, 'header' | 'summary' | 'body'> & {
  children: React.ReactNode
}) {
  const resolvedBodyId = resolveBodyId(props.itemId, props.bodyId)
  const gripVisible = (props.showDragHandle ?? false) && Boolean(props.dragHandleProps)
  const collapsible = props.collapsible ?? false

  const contextValue = React.useMemo(
    (): CollapsibleListItemContextValue => ({
      itemId: props.itemId,
      titleId: props.titleId,
      bodyId: resolvedBodyId,
      toolbarAriaLabel: props.toolbarAriaLabel,
      leadingChrome: { showDragHandle: gripVisible, collapsible },
      collapsible,
      collapsed: props.collapsed,
      onToggleCollapse: props.onToggleCollapse,
      gripVisible,
      dragHandleProps: props.dragHandleProps
        ? {
            ariaLabel: `Drag to reorder ${props.toolbarAriaLabel}`,
            attributes: props.dragHandleProps.attributes,
            listeners: props.dragHandleProps.listeners,
          }
        : undefined,
      tone: props.tone ?? 'default',
      layout: props.layout ?? 'default',
      dragging: props.dragging || Boolean(props.dragHandleProps?.isDragging),
      itemPrefix: props.itemPrefix,
      className: props.className,
    }),
    [props, resolvedBodyId, gripVisible, collapsible],
  )

  return (
    <CollapsibleListItemContext.Provider value={contextValue}>
      <CollapsibleListItemShell
        titleId={props.titleId}
        itemPrefix={props.itemPrefix}
        showDragHandle={gripVisible}
        collapsible={collapsible}
        dragging={contextValue.dragging}
        layout={contextValue.layout}
        tone={contextValue.tone}
        className={props.className}
        main={children}
        actions={actions}
      />
    </CollapsibleListItemContext.Provider>
  )
}

function CollapsibleListItemCompoundToolbar({
  header,
  summary,
  compact,
}: {
  header: React.ReactNode
  summary?: React.ReactNode
  compact?: boolean
}) {
  const context = useCollapsibleListItemContext('CollapsibleListItem.Toolbar')

  return (
    <CollapsibleListItemToolbar
      titleId={context.titleId}
      toolbarAriaLabel={context.toolbarAriaLabel}
      leadingChrome={context.leadingChrome}
      gripVisible={context.gripVisible}
      dragHandleProps={context.dragHandleProps}
      collapsible={context.collapsible}
      collapsed={context.collapsed}
      onToggleCollapse={context.onToggleCollapse}
      bodyId={context.bodyId}
      compact={compact}
      header={header}
      summary={summary}
    />
  )
}

function CollapsibleListItemCompoundCollapseButton() {
  const context = useCollapsibleListItemContext('CollapsibleListItem.CollapseButton')

  if (!context.collapsible) return null

  return (
    <CollapsibleListItemCollapseButton
      collapsed={context.collapsed}
      bodyId={context.bodyId}
      ariaLabel={context.toolbarAriaLabel}
      onToggleCollapse={context.onToggleCollapse}
    />
  )
}

function CollapsibleListItemCompoundHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const context = useCollapsibleListItemContext('CollapsibleListItem.Header')

  return (
    <div id={context.titleId} className={cn('min-w-0 flex-1', className)}>
      {children}
    </div>
  )
}

function CollapsibleListItemCompoundBody({
  children,
  bodyId,
  hidden,
  className,
}: {
  children: React.ReactNode
  bodyId?: string
  hidden?: boolean
  className?: string
}) {
  const context = useCollapsibleListItemContext('CollapsibleListItem.Body')
  const resolvedBodyId = bodyId ?? context.bodyId
  const isHidden = hidden ?? context.collapsed

  return (
    <CollapsibleListItemBody
      bodyId={resolvedBodyId}
      hidden={isHidden}
      className={cn(collapsibleListItemBodyClasses(context.leadingChrome), className)}
    >
      {children}
    </CollapsibleListItemBody>
  )
}

export interface CollapsibleListItemBodyProps {
  bodyId: string
  hidden?: boolean
  className?: string
  children: React.ReactNode
}

export function CollapsibleListItemBody({
  bodyId,
  hidden = false,
  className,
  children,
}: CollapsibleListItemBodyProps) {
  return (
    <div
      id={bodyId}
      hidden={hidden || undefined}
      className={cn(className)}
      aria-hidden={hidden || undefined}
    >
      {children}
    </div>
  )
}

function CollapsibleListItemCompoundActions({
  children,
  compact,
  embedded,
  className,
}: {
  children: React.ReactNode
  compact?: boolean
  embedded?: boolean
  className?: string
}) {
  return (
    <CollapsibleListItemActions compact={compact} embedded={embedded} className={className}>
      {children}
    </CollapsibleListItemActions>
  )
}

/** Orchestrator for one collapsible list row — shell, toolbar, optional body, and actions rail. */
export function CollapsibleListItem(props: CollapsibleListItemProps) {
  return <CollapsibleListItemRoot {...props} />
}

CollapsibleListItem.Root = CollapsibleListItemCompoundRoot
CollapsibleListItem.Toolbar = CollapsibleListItemCompoundToolbar
CollapsibleListItem.CollapseButton = CollapsibleListItemCompoundCollapseButton
CollapsibleListItem.Header = CollapsibleListItemCompoundHeader
CollapsibleListItem.Body = CollapsibleListItemCompoundBody
CollapsibleListItem.Actions = CollapsibleListItemCompoundActions
CollapsibleListItem.Shell = CollapsibleListItemShell
CollapsibleListItem.DragHandle = CollapsibleListItemDragHandle
CollapsibleListItem.CollapseButtonPrimitive = CollapsibleListItemCollapseButton

export { collapsibleListItemBodyClasses }
