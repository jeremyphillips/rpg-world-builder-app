import { Badge } from '@rpg/ui'

import type { MasterDetailListBadge } from './master-detail-list-panel.client'

export interface MasterDetailRowBadgesProps {
  badges: MasterDetailListBadge[]
}

export function MasterDetailRowBadges({ badges }: MasterDetailRowBadgesProps) {
  if (!badges.length) return null

  return (
    <span className="mt-1 flex flex-wrap items-center gap-1">
      {badges.map((badge) => (
        <Badge key={badge.label} variant={badge.variant ?? 'outline'} className="text-[10px]">
          {badge.label}
        </Badge>
      ))}
    </span>
  )
}
