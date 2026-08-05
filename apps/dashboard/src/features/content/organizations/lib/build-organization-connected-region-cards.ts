import type { OrganizationConnectedRegionsResponse } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { ORGANIZATION_CONNECTED_REGION_FAMILY_LABELS } from './organization-connected-regions.constants'
import type { OrganizationConnectedRegionPreviewItem } from './organization-display'

export function buildOrganizationConnectedRegionCards(
  connectedRegions: OrganizationConnectedRegionsResponse,
  routeContext: { campaignId: string; canWriteInverseTerritorial?: boolean },
): {
  previewItems: OrganizationConnectedRegionPreviewItem[]
  total: number
} {
  const canWriteInverseTerritorial = routeContext.canWriteInverseTerritorial ?? false

  return {
    previewItems: connectedRegions.items.map((connectedRegion) => ({
      relationshipId: connectedRegion.relationshipId,
      relationshipFamily: connectedRegion.relationshipFamily,
      relationshipKind: connectedRegion.relationshipKind,
      regionId: connectedRegion.region.id,
      card: {
        id: connectedRegion.region.id,
        name: connectedRegion.region.name,
        summary: `${ORGANIZATION_CONNECTED_REGION_FAMILY_LABELS[connectedRegion.relationshipFamily]} · ${connectedRegion.relationshipLabel}`,
      },
      detailHref: ROUTES.content.locations.detail(
        routeContext.campaignId,
        connectedRegion.region.id,
      ),
      canEditTerritorial:
        canWriteInverseTerritorial && connectedRegion.relationshipFamily === 'territorialAuthority',
    })),
    total: connectedRegions.total,
  }
}
