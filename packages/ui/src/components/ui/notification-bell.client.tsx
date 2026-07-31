'use client'

import { Bell } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { Button, type ButtonProps } from './button.client'
import { NotificationUnreadBadge } from './notification-unread-badge'

export type NotificationBellProps = Omit<ButtonProps, 'children' | 'size' | 'variant'> & {
  unreadCount?: number
  ariaLabel?: string
}

export const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>(
  function NotificationBell(
    { unreadCount = 0, ariaLabel, className, type = 'button', ...props },
    ref,
  ) {
    const resolvedAriaLabel =
      ariaLabel ?? (unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications')

    return (
      <div className={cn('relative inline-flex', className)}>
        <Button
          ref={ref}
          type={type}
          variant="ghost"
          size="icon"
          aria-label={resolvedAriaLabel}
          className="shrink-0 hover:bg-transparent hover:text-foreground active:bg-transparent [&_svg]:size-5"
          {...props}
        >
          <Bell />
        </Button>
        <NotificationUnreadBadge count={unreadCount} />
      </div>
    )
  },
)

NotificationBell.displayName = 'NotificationBell'
