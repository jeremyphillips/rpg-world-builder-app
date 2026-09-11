import type {
  ContentSource,
  ContentStatus,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { CONTENT_SOURCE_BADGE } from '../overview/content-source-badge'
import { shouldPresentContentSource } from '../content-type-presentation'

export interface ContentEditHeadingBadgesProps {
  contentType: ContentTypeKey
  source: ContentSource
  status: ContentStatus
  campaignAccess: ResolvedContentCampaignAccess
  /** When true, the Draft badge is omitted (shown on the preview rail instead). */
  omitDraft?: boolean
}

export function ContentEditHeadingBadges({
  contentType,
  source,
  status,
  campaignAccess,
  omitDraft = false,
}: ContentEditHeadingBadgesProps) {
  const isDraft = !omitDraft && source === 'homebrew' && status === 'draft'
  const sourceBadge = CONTENT_SOURCE_BADGE[source]
  const showSource = shouldPresentContentSource(contentType)

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
      {showSource ? (
        <Badge appearance={sourceBadge.appearance} tone={sourceBadge.tone}>
          {sourceBadge.label}
        </Badge>
      ) : null}
    </div>
  )
}
