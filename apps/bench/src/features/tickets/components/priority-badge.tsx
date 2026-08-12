import type { TicketPriority } from '@rpg/contracts/dev-bench'
import { getTicketPriorityLabel } from '@rpg/contracts/dev-bench'
import type { BadgeAppearance, BadgeTone } from '@rpg/ui'
import { Badge } from '@rpg/ui'

const priorityBadge: Record<TicketPriority, { appearance: BadgeAppearance; tone: BadgeTone }> = {
  low: { appearance: 'soft', tone: 'neutral' },
  medium: { appearance: 'outline', tone: 'neutral' },
  high: { appearance: 'soft', tone: 'info' },
  critical: { appearance: 'soft', tone: 'destructive' },
}

interface PriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { appearance, tone } = priorityBadge[priority]

  return (
    <Badge appearance={appearance} tone={tone} size="sm" className={className}>
      {getTicketPriorityLabel(priority)}
    </Badge>
  )
}
