import type { EpicCardMeta } from '@/features/epics'

import { benchEpicPath } from '@/app/routes'
import { DEFAULT_EPIC_BADGE_COLOR } from '@rpg/contracts/dev-bench'
import { Badge, cn } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { badgeTextColorForBackground, epicBadgeBackgroundColor } from '../lib/epic-badge.lib'
import { epicBadgeLinkClasses, epicBadgeNoEpicClasses } from './epic-badge.variants'

const NO_EPIC_BADGE_LABEL = 'No epic'

interface EpicBadgeProps {
  epic: EpicCardMeta | null
  className?: string
  /** When nested in a clickable card, stop activation from bubbling. */
  stopActivation?: boolean
}

function stopCardActivation(event: { stopPropagation: () => void }) {
  event.stopPropagation()
}

export function EpicBadge({ epic, className, stopActivation = false }: EpicBadgeProps) {
  if (!epic) {
    return (
      <Badge size="sm" className={cn(epicBadgeNoEpicClasses, 'max-w-full truncate', className)}>
        {NO_EPIC_BADGE_LABEL}
      </Badge>
    )
  }

  const backgroundColor = epicBadgeBackgroundColor(epic.badgeColor)
  const color = badgeTextColorForBackground(backgroundColor)

  return (
    <Link
      to={benchEpicPath(epic.id)}
      className={cn(epicBadgeLinkClasses, className)}
      aria-label={`Open epic ${epic.title}`}
      onClick={stopActivation ? stopCardActivation : undefined}
      onKeyDown={stopActivation ? stopCardActivation : undefined}
    >
      <Badge
        size="sm"
        className="max-w-full truncate border-transparent"
        style={{ backgroundColor, color }}
      >
        {epic.title}
      </Badge>
    </Link>
  )
}

export { NO_EPIC_BADGE_LABEL, DEFAULT_EPIC_BADGE_COLOR }
