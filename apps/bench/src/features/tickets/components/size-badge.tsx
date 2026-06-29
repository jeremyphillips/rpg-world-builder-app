import type { TicketSize } from '@rpg/contracts/dev-bench'
import { getTicketSizeLabel } from '@rpg/contracts/dev-bench'
import { Badge } from '@rpg/ui'

interface SizeBadgeProps {
  size: TicketSize
  className?: string
}

export function SizeBadge({ size, className }: SizeBadgeProps) {
  return (
    <Badge variant="outline" size="sm" className={className}>
      {getTicketSizeLabel(size)}
    </Badge>
  )
}
