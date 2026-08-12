import type { TicketType } from '@rpg/contracts/dev-bench'
import { getTicketTypeLabel } from '@rpg/contracts/dev-bench'
import { Badge } from '@rpg/ui'

interface TypeBadgeProps {
  type: TicketType
  className?: string
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <Badge appearance="soft" tone="neutral" size="sm" className={className}>
      {getTicketTypeLabel(type)}
    </Badge>
  )
}
