import type { OrganizationConnectedRegionsResponse } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { ORGANIZATION_CONNECTED_REGION_FAMILY_LABELS } from './organization-connected-regions.constants'
import type { OrganizationConnectedRegionPreviewItem } from './organization-display'

export function buildOrganizationConnectedRegionCards(
  connectedRegions: OrganizationConnectedRegionsResponse,
  routeContext: { campaignId: string },
): {
  previewItems: OrganizationConnectedRegionPreviewItem[]
  total: number
} {
  return {
    previewItems: connectedRegions.items.map((connectedRegion) => ({
      card: {
        id: connectedRegion.region.id,
        name: connectedRegion.region.name,
        summary: `${ORGANIZATION_CONNECTED_REGION_FAMILY_LABELS[connectedRegion.relationshipFamily]} · ${connectedRegion.relationshipLabel}`,
      },
      detailHref: ROUTES.content.locations.detail(
        routeContext.campaignId,
        connectedRegion.region.id,
      ),
    })),
    total: connectedRegions.total,
  }
}
