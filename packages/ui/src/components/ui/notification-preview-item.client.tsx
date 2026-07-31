'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Text } from './text'
import { notificationPreviewItemVariants } from './notification-preview-item.variants'

export type NotificationPreviewItemProps = {
  title: React.ReactNode
  description?: React.ReactNode
  timestamp: React.ReactNode
  unread?: boolean
  icon?: React.ReactNode
  onActivate?: () => void
  className?: string
}

export function NotificationPreviewItem({
  title,
  description,
  timestamp,
  unread = false,
  icon,
  onActivate,
  className,
}: NotificationPreviewItemProps) {
  const titleText = typeof title === 'string' ? title : 'Notification'
  const activateLabel = unread ? `Unread: ${titleText}` : titleText

  const content = (
    <div className="flex min-w-0 items-start gap-3">
      {icon ? <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div> : null}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Text
            as="p"
            className={cn(
              'text-sm',
              unread ? 'font-body-emphasis text-foreground' : 'text-foreground',
            )}
          >
            {title}
          </Text>
          <Text as="span" variant="muted" className="shrink-0 text-xs">
            {timestamp}
          </Text>
        </div>
        {description ? (
          <Text as="p" variant="muted" className="line-clamp-2 text-sm">
            {description}
          </Text>
        ) : null}
      </div>
      {unread ? (
        <span
          aria-hidden="true"
          className="mt-2 size-2 shrink-0 rounded-full bg-primary"
          title="Unread"
        />
      ) : null}
    </div>
  )

  if (!onActivate) {
    return <div className={cn('px-3 py-2.5', className)}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={activateLabel}
      className={cn(notificationPreviewItemVariants({ unread }), className)}
    >
      {content}
    </button>
  )
}
