import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import type { CollapsibleListItemDragHandleProps } from './collapsible-list-item-toolbar.client'
import type {
  CollapsibleListItemLeadingChromeOptions,
  CollapsibleListItemRowLayout,
} from './collapsible-list-item.variants'

/** Resolved shell placement for trailing header actions — not a public prop. */
export type CollapsibleListItemHeaderActionsPlacement = 'start' | 'center'

export type CollapsibleListItemDragHandleConfig = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  isDragging?: boolean
}

/**
 * Trailing actions on the title row (`center`) vs the default side rail (`start`).
 * `entity-card` and default disclosure rows center; compact inline rows stay on the rail.
 */
export function resolveCollapsibleListItemHeaderActionsPlacement(
  layout: 'default' | 'compactRow',
  rowLayout: CollapsibleListItemRowLayout = 'default',
): CollapsibleListItemHeaderActionsPlacement {
  if (rowLayout === 'entity-card') return 'center'
  if (layout === 'compactRow') return 'start'
  return 'center'
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
