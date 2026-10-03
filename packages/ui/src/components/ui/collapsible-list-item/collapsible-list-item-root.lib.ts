import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import type { CollapsibleListItemDragHandleProps } from './collapsible-list-item-toolbar.client'
import type { CollapsibleListItemActionsAlign } from './collapsible-list-item-shell.client'
import type {
  CollapsibleListItemLeadingChromeOptions,
  CollapsibleListItemRowLayout,
} from './collapsible-list-item.variants'

export type CollapsibleListItemDragHandleConfig = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  isDragging?: boolean
}

/** `entity-card` hosts own header alignment (RowAnatomy), so they always take the header-row shell. */
export function resolveCollapsibleListItemActionsAlign(
  actionsAlign: CollapsibleListItemActionsAlign | undefined,
  reserveDragHandleSlot: boolean,
  layout: 'default' | 'compactRow',
  rowLayout: CollapsibleListItemRowLayout = 'default',
): CollapsibleListItemActionsAlign {
  if (rowLayout === 'entity-card') return 'center'
  return actionsAlign ?? (reserveDragHandleSlot || layout === 'compactRow' ? 'start' : 'center')
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
  reserveDragHandleSlot: boolean,
  collapsible: boolean,
): CollapsibleListItemLeadingChromeOptions {
  return {
    reserveDragHandleSlot,
    showDragHandle: reserveDragHandleSlot,
    collapsible,
  }
}
