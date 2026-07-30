'use client'

import { Bell } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { NotificationUnreadBadge } from './notification-unread-badge'

export type NotificationBellProps = {
  unreadCount?: number
  ariaLabel?: string
  className?: string
  onClick?: () => void
}

export function NotificationBell({
  unreadCount = 0,
  ariaLabel,
  className,
  onClick,
}: NotificationBellProps) {
  const resolvedAriaLabel =
    ariaLabel ?? (unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications')

  return (
    <div className={cn('relative inline-flex', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={resolvedAriaLabel}
        onClick={onClick}
        className="shrink-0"
      >
        <Bell className="size-4" />
      </Button>
      <NotificationUnreadBadge count={unreadCount} />
    </div>
  )
}
