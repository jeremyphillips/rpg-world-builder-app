import type {
  CatalogLayer,
  ContentStatus,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { CATALOG_LAYER_BADGE } from '../overview/content-source-badge'
import { shouldPresentCatalogLayer } from '../content-type-presentation'

export interface ContentEditHeadingBadgesProps {
  contentType: ContentTypeKey
  catalogLayer: CatalogLayer
  status: ContentStatus
  campaignAccess: ResolvedContentCampaignAccess
  /** When true, the Draft badge is omitted (shown on the preview rail instead). */
  omitDraft?: boolean
}

export function ContentEditHeadingBadges({
  contentType,
  catalogLayer,
  status,
  campaignAccess,
  omitDraft = false,
}: ContentEditHeadingBadgesProps) {
  const isDraft = !omitDraft && catalogLayer === 'homebrew' && status === 'draft'
  const sourceBadge = CATALOG_LAYER_BADGE[catalogLayer]
  const showSource = shouldPresentCatalogLayer(contentType)

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
