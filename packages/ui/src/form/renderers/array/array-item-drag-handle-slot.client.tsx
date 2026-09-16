'use client'

import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { GripVertical } from 'lucide-react'

import { cn } from '../../../lib/utils'
import { ArrayItemDragHandle } from './array-item-header.client'
import { arrayItemDragHandleClasses } from './array-item-toolbar.variants'

export interface ArrayItemDragHandleSlotProps {
  reserveSlot: boolean
  sortableEnabled: boolean
  ariaLabel: string
  attributes?: DraggableAttributes
  listeners?: SyntheticListenerMap
  compact?: boolean
  className?: string
}

/** Reserved grip column — interactive handle when sortable, inert placeholder otherwise. */
export function ArrayItemDragHandleSlot({
  reserveSlot,
  sortableEnabled,
  ariaLabel,
  attributes,
  listeners,
  compact = false,
  className,
}: ArrayItemDragHandleSlotProps) {
  if (!reserveSlot) return null

  if (sortableEnabled && attributes) {
    return (
      <ArrayItemDragHandle
        ariaLabel={ariaLabel}
        attributes={attributes}
        listeners={listeners}
        compact={compact}
        className={className}
      />
    )
  }

  return (
    <span
      className={cn(
        arrayItemDragHandleClasses({ compact }),
        'pointer-events-none opacity-0',
        className,
      )}
      aria-hidden
    >
      <GripVertical aria-hidden />
    </span>
  )
}
