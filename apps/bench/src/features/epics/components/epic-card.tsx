import { Link } from 'react-router-dom'

import type { Epic } from '@rpg/contracts/dev-bench'
import type { Ticket } from '@rpg/contracts/dev-bench'
import type { EpicTicketBucket } from '@rpg/dev-bench-core'
import { Card, CardContent, Text } from '@rpg/ui'

import { benchEpicPath } from '@/app/routes'
import { PriorityBadge } from '@/features/tickets'

import { EpicStatusBadge } from './epic-status-badge'
import { EpicTicketCounts } from './epic-ticket-counts'

interface EpicCardProps {
  epic: Epic
  counts: Record<EpicTicketBucket, number>
  recentlyActive: Ticket[]
}

export function EpicCard({ epic, counts, recentlyActive }: EpicCardProps) {
  const summary = epic.goal?.trim() || epic.description?.trim()

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <Link to={benchEpicPath(epic.id)} className="font-medium hover:underline">
            {epic.title}
          </Link>
          {summary ? (
            <Text variant="small" className="line-clamp-2 text-muted-foreground">
              {summary}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EpicStatusBadge status={epic.status} />
          {epic.priority ? <PriorityBadge priority={epic.priority} /> : null}
          {epic.area ? (
            <Text variant="small" className="text-muted-foreground">
              {epic.area}
            </Text>
          ) : null}
        </div>
        <EpicTicketCounts counts={counts} />
        {recentlyActive.length > 0 ? (
          <div className="space-y-1">
            <Text variant="small" className="font-medium">
              Recently active
            </Text>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {recentlyActive.map((ticket) => (
                <li key={ticket.id} className="truncate">
                  {ticket.key}: {ticket.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
