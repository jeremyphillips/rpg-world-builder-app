import type { EpicStatus } from '@rpg/contracts/dev-bench'
import { getEpicStatusLabel } from '@rpg/contracts/dev-bench'
import { Badge, cn } from '@rpg/ui'

const statusClassName: Record<EpicStatus, string> = {
  active: 'border-transparent bg-primary text-primary-foreground',
  paused: 'border-border bg-background text-foreground',
  done: 'border-transparent bg-secondary text-secondary-foreground',
}

interface EpicStatusBadgeProps {
  status: EpicStatus
  className?: string
}

export function EpicStatusBadge({ status, className }: EpicStatusBadgeProps) {
  return (
    <Badge variant="outline" size="sm" className={cn(statusClassName[status], className)}>
      {getEpicStatusLabel(status)}
    </Badge>
  )
}
