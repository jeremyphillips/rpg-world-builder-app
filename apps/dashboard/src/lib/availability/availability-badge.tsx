import { Badge } from '@rpg/ui'

import { resolveAvailabilityBadge, type Availability } from './availability'

export interface AvailabilityBadgeProps {
  availability: Availability
}

/** Standalone inactive badge derived from availability reasons. */
export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const badge = resolveAvailabilityBadge(availability)
  if (!badge) return null

  return (
    <Badge appearance={badge.appearance} tone={badge.tone} size="sm">
      {badge.label}
    </Badge>
  )
}
