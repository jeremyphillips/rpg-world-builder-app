import { cn } from '../../lib/utils'
import { Badge } from './badge'

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
    <Badge
      aria-hidden
      appearance="soft"
      tone="destructive"
      size="sm"
      className={cn(
        'absolute -right-1 -top-1 min-w-4 justify-center px-1 text-[10px] leading-none',
        className,
      )}
    >
      {formatUnreadCount(count)}
    </Badge>
  )
}
