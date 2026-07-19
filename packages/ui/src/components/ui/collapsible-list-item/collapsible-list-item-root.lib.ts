import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import type { CollapsibleListItemDragHandleProps } from './collapsible-list-item-toolbar.client'
import type { CollapsibleListItemActionsAlign } from './collapsible-list-item-shell.client'
import type { CollapsibleListItemLeadingChromeOptions } from './collapsible-list-item.variants'

export type CollapsibleListItemDragHandleConfig = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  isDragging?: boolean
}

export function resolveCollapsibleListItemActionsAlign(
  actionsAlign: CollapsibleListItemActionsAlign | undefined,
  gripVisible: boolean,
  layout: 'default' | 'compactRow',
): CollapsibleListItemActionsAlign {
  return actionsAlign ?? (gripVisible || layout === 'compactRow' ? 'start' : 'center')
}

export function resolveCollapsibleListItemDragHandleProps(
  toolbarAriaLabel: string,
  dragHandleProps?: CollapsibleListItemDragHandleConfig,
): CollapsibleListItemDragHandleProps | undefined {
  if (!dragHandleProps) return undefined

  return {
    ariaLabel: `Drag to reorder ${toolbarAriaLabel}`,
    attributes: dragHandleProps.attributes,
    listeners: dragHandleProps.listeners,
  }
}

export function buildCollapsibleListItemLeadingChrome(
  gripVisible: boolean,
  collapsible: boolean,
): CollapsibleListItemLeadingChromeOptions {
  return {
    showDragHandle: gripVisible,
    collapsible,
  }
}
