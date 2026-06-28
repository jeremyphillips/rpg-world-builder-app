import type { TicketPriority } from '@rpg/contracts/dev-bench'
import { getTicketPriorityLabel } from '@rpg/contracts/dev-bench'
import { Badge, cn } from '@rpg/ui'

const priorityClassName: Record<TicketPriority, string> = {
  low: 'border-transparent bg-secondary text-secondary-foreground',
  medium: 'border-border bg-background text-foreground',
  high: 'border-transparent bg-primary text-primary-foreground',
  critical: 'border-transparent bg-destructive text-destructive-foreground',
}

interface PriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" size="sm" className={cn(priorityClassName[priority], className)}>
      {getTicketPriorityLabel(priority)}
    </Badge>
  )
}
