import { cn } from '../../lib/utils'
import { notificationUnreadBadgeVariants } from './notification-unread-badge.variants'

export type NotificationUnreadBadgeProps = {
  count: number
  className?: string
}

function formatUnreadCount(count: number): string {
  if (count > 99) return '99+'
  if (count > 9) return '9+'
  return String(count)
}

/** Compact unread count badge for notification triggers. */
export function NotificationUnreadBadge({ count, className }: NotificationUnreadBadgeProps) {
  if (count <= 0) return null

  return (
    <span aria-hidden className={cn(notificationUnreadBadgeVariants({ tone: 'alert' }), className)}>
      {formatUnreadCount(count)}
    </span>
  )
}
