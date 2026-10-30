import type {
  CatalogLayer,
  ContentStatus,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { CATALOG_LAYER_BADGE } from '../overview/catalog-layer-badge'
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
  const catalogLayerBadge = CATALOG_LAYER_BADGE[catalogLayer]
  const showCatalogLayer = shouldPresentCatalogLayer(contentType)

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
      {showCatalogLayer ? (
        <Badge appearance={catalogLayerBadge.appearance} tone={catalogLayerBadge.tone}>
          {catalogLayerBadge.label}
        </Badge>
      ) : null}
    </div>
  )
}
