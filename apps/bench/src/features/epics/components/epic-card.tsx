import { Link } from 'react-router-dom'

import type { Epic } from '@rpg/contracts/dev-bench'
import type { Ticket } from '@rpg/contracts/dev-bench'
import type { EpicTicketBucket } from '@rpg/dev-bench-core'
import { Card, CardContent, extractRichTextContent, Text } from '@rpg/ui'

import { benchEpicPath, benchTicketPath } from '@/app/routes'
import { epicBadgeBackgroundColor, PriorityBadge } from '@/features/tickets'

import { EpicStatusBadge } from './epic-status-badge'
import { EpicTicketCounts } from './epic-ticket-counts'

const epicCardRecentItemClasses =
  'block w-full truncate rounded-sm text-left hover:text-foreground hover:underline ui-focus-ring text-style-caption'

interface EpicCardProps {
  epic: Epic
  counts: Record<EpicTicketBucket, number>
  recentlyActive: Ticket[]
  onSelectTicket?: (ticketId: string) => void
}

export function EpicCard({ epic, counts, recentlyActive, onSelectTicket }: EpicCardProps) {
  const descriptionSummary = epic.description ? extractRichTextContent(epic.description) : undefined
  const summary = epic.goal?.trim() || descriptionSummary
  const accentColor = epicBadgeBackgroundColor(epic.badgeColor)

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex gap-3">
          <div
            className="w-1 shrink-0 self-stretch rounded-full"
            style={{ backgroundColor: accentColor }}
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-1">
            <Link to={benchEpicPath(epic.id)} className="font-medium hover:underline">
              {epic.title}
            </Link>
            {summary ? (
              <Text variant="supporting" className="line-clamp-2">
                {summary}
              </Text>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EpicStatusBadge status={epic.status} />
          {epic.priority ? <PriorityBadge priority={epic.priority} /> : null}
          {epic.area ? <Text variant="supporting">{epic.area}</Text> : null}
        </div>
        <EpicTicketCounts counts={counts} />
        {recentlyActive.length > 0 ? (
          <div className="space-y-1">
            <Text className="text-xs font-medium">Recently active</Text>
            <ul className="space-y-0.5">
              {recentlyActive.map((ticket) => (
                <li key={ticket.id}>
                  {onSelectTicket ? (
                    <button
                      type="button"
                      className={epicCardRecentItemClasses}
                      onClick={() => onSelectTicket(ticket.id)}
                    >
                      {ticket.key}: {ticket.title}
                    </button>
                  ) : (
                    <Link to={benchTicketPath(ticket.id)} className={epicCardRecentItemClasses}>
                      {ticket.key}: {ticket.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
