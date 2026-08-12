import type { EpicStatus } from '@rpg/contracts/dev-bench'
import { getEpicStatusLabel } from '@rpg/contracts/dev-bench'
import type { BadgeAppearance, BadgeTone } from '@rpg/ui'
import { Badge } from '@rpg/ui'

const statusBadge: Record<EpicStatus, { appearance: BadgeAppearance; tone: BadgeTone }> = {
  active: { appearance: 'soft', tone: 'info' },
  paused: { appearance: 'outline', tone: 'neutral' },
  done: { appearance: 'soft', tone: 'neutral' },
}

interface EpicStatusBadgeProps {
  status: EpicStatus
  className?: string
}

export function EpicStatusBadge({ status, className }: EpicStatusBadgeProps) {
  const { appearance, tone } = statusBadge[status]

  return (
    <Badge appearance={appearance} tone={tone} size="sm" className={className}>
      {getEpicStatusLabel(status)}
    </Badge>
  )
}
