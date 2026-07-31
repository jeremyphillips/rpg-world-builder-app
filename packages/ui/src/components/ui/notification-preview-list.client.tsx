'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  NotificationPreviewItem,
  type NotificationPreviewItemProps,
} from './notification-preview-item.client'

export type NotificationPreviewListItem = Omit<
  NotificationPreviewItemProps,
  'className' | 'onActivate'
> & {
  id: string
  onActivate?: () => void
}

export type NotificationPreviewListProps = {
  items: readonly NotificationPreviewListItem[]
  className?: string
  footerSlot?: React.ReactNode
}

export function NotificationPreviewList({
  items,
  className,
  footerSlot,
}: NotificationPreviewListProps) {
  return (
    <div className={cn('max-h-96 overflow-y-auto divide-y divide-border', className)}>
      {items.map((item) => (
        <NotificationPreviewItem
          key={item.id}
          title={item.title}
          description={item.description}
          timestamp={item.timestamp}
          unread={item.unread}
          icon={item.icon}
          actionLabel={item.actionLabel}
          onActivate={item.onActivate}
        />
      ))}
      {footerSlot}
    </div>
  )
}
