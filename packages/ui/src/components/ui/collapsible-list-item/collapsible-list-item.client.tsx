'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils'
import { CollapsibleListItemActions } from './collapsible-list-item-actions.client'
import {
  CollapsibleListItemShell,
  type CollapsibleListItemActionsAlign,
  type CollapsibleListItemShellPreset,
} from './collapsible-list-item-shell.client'
import type { FieldStatusTone, SemanticSurfaceTone } from '../field-surface.variants'
import type { SurfaceConfig } from '../visual-vocabulary.types'
import {
  CollapsibleListItemCollapseButton,
  CollapsibleListItemDragHandle,
  CollapsibleListItemToolbar,
  type CollapsibleListItemDragHandleProps,
} from './collapsible-list-item-toolbar.client'
import {
  collapsibleListItemBodyClasses,
  resolveCollapsibleListItemDomIds,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item.variants'
import {
  buildCollapsibleListItemLeadingChrome,
  resolveCollapsibleListItemActionsAlign,
  resolveCollapsibleListItemDragHandleProps,
  type CollapsibleListItemDragHandleConfig,
} from './collapsible-list-item-root.lib'

export type { CollapsibleListItemDragHandleConfig } from './collapsible-list-item-root.lib'

export interface CollapsibleListItemProps {
  itemId: string
  titleId?: string
  toolbarAriaLabel: string
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  /** Uncontrolled initial state when `collapsed` is omitted. Defaults to collapsed. */
  defaultCollapsed?: boolean
  showDragHandle?: boolean
  dragHandleProps?: CollapsibleListItemDragHandleConfig
  preset?: CollapsibleListItemShellPreset
  surface?: SurfaceConfig
  tone?: SemanticSurfaceTone
  status?: FieldStatusTone
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
  preset: CollapsibleListItemShellPreset
  surface?: SurfaceConfig
  tone?: SemanticSurfaceTone
  status?: FieldStatusTone
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

function useCollapseState(
  collapsed: boolean | undefined,
  onToggleCollapse: (() => void) | undefined,
  defaultCollapsed = true,
): readonly [boolean, () => void] {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed)
  const isControlled = collapsed !== undefined

  const resolvedCollapsed = isControlled ? collapsed : internalCollapsed
  const resolvedToggle = React.useCallback(() => {
    if (isControlled) {
      onToggleCollapse?.()
      return
    }

    setInternalCollapsed((current) => !current)
  }, [isControlled, onToggleCollapse])

  return [resolvedCollapsed, resolvedToggle] as const
}

function CollapsibleListItemRoot({
  itemId,
  titleId: titleIdProp,
  toolbarAriaLabel,
  collapsible = false,
  collapsed: collapsedProp,
  onToggleCollapse,
  defaultCollapsed = true,
  showDragHandle = false,
  dragHandleProps,
  preset = 'default',
  surface,
  status,
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
  const domIds = resolveCollapsibleListItemDomIds(itemId)
  const titleId = titleIdProp ?? domIds.titleId
  const resolvedBodyId = bodyId ?? domIds.bodyId
  const [collapsed, handleToggleCollapse] = useCollapseState(
    collapsedProp,
    onToggleCollapse,
    defaultCollapsed,
  )
  const gripVisible = showDragHandle && Boolean(dragHandleProps)
  const actionsAlign = resolveCollapsibleListItemActionsAlign(actionsAlignProp, gripVisible, layout)
  const leadingChrome = buildCollapsibleListItemLeadingChrome(gripVisible, collapsible)
  const resolvedDragHandleProps = resolveCollapsibleListItemDragHandleProps(
    toolbarAriaLabel,
    dragHandleProps,
  )

  const contextValue = React.useMemo(
    (): CollapsibleListItemContextValue => ({
      itemId,
      titleId,
      bodyId: resolvedBodyId,
      toolbarAriaLabel,
      leadingChrome,
      collapsible,
      collapsed,
      onToggleCollapse: handleToggleCollapse,
      gripVisible,
      dragHandleProps: resolvedDragHandleProps,
      preset,
      surface,
      status,
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
      handleToggleCollapse,
      gripVisible,
      resolvedDragHandleProps,
      preset,
      surface,
      status,
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
        preset={preset}
        surface={surface}
        status={status}
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
            onToggleCollapse={handleToggleCollapse}
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
              className={cn(
                collapsibleListItemBodyClasses({ ...leadingChrome, preset }),
                bodyClassName,
              )}
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
  const domIds = resolveCollapsibleListItemDomIds(props.itemId)
  const titleId = props.titleId ?? domIds.titleId
  const resolvedBodyId = props.bodyId ?? domIds.bodyId
  const gripVisible = (props.showDragHandle ?? false) && Boolean(props.dragHandleProps)
  const collapsible = props.collapsible ?? false
  const [collapsed, handleToggleCollapse] = useCollapseState(
    props.collapsed,
    props.onToggleCollapse,
    props.defaultCollapsed ?? true,
  )

  const contextValue = React.useMemo(
    (): CollapsibleListItemContextValue => ({
      itemId: props.itemId,
      titleId,
      bodyId: resolvedBodyId,
      toolbarAriaLabel: props.toolbarAriaLabel,
      leadingChrome: { showDragHandle: gripVisible, collapsible },
      collapsible,
      collapsed,
      onToggleCollapse: handleToggleCollapse,
      gripVisible,
      dragHandleProps: resolveCollapsibleListItemDragHandleProps(
        props.toolbarAriaLabel,
        props.dragHandleProps,
      ),
      preset: props.preset ?? 'default',
      surface: props.surface,
      status: props.status,
      layout: props.layout ?? 'default',
      dragging: props.dragging || Boolean(props.dragHandleProps?.isDragging),
      itemPrefix: props.itemPrefix,
      className: props.className,
    }),
    [props, titleId, resolvedBodyId, gripVisible, collapsible, collapsed, handleToggleCollapse],
  )

  return (
    <CollapsibleListItemContext.Provider value={contextValue}>
      <CollapsibleListItemShell
        titleId={titleId}
        itemPrefix={props.itemPrefix}
        showDragHandle={gripVisible}
        collapsible={collapsible}
        dragging={contextValue.dragging}
        layout={contextValue.layout}
        preset={contextValue.preset}
        surface={contextValue.surface}
        status={contextValue.status}
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
      className={cn(
        collapsibleListItemBodyClasses({ ...context.leadingChrome, preset: context.preset }),
        className,
      )}
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
