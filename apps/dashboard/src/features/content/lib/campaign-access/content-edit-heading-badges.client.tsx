import type { ContentSource, ContentStatus, ResolvedContentCampaignAccess } from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { CONTENT_SOURCE_BADGE } from '../overview/content-source-badge'

export interface ContentEditHeadingBadgesProps {
  source: ContentSource
  status: ContentStatus
  campaignAccess: ResolvedContentCampaignAccess
}

export function ContentEditHeadingBadges({
  source,
  status,
  campaignAccess,
}: ContentEditHeadingBadgesProps) {
  const isDraft = source === 'homebrew' && status === 'draft'
  const sourceBadge = CONTENT_SOURCE_BADGE[source]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isDraft ? (
        <Badge appearance="outline" tone="warning">
          Draft
        </Badge>
      ) : campaignAccess.effectiveAudience === 'none' ? (
        <Badge appearance="outline" tone="warning">
          Inactive
        </Badge>
      ) : null}
      <Badge appearance={sourceBadge.appearance} tone={sourceBadge.tone}>
        {sourceBadge.label}
      </Badge>
    </div>
  )
}
