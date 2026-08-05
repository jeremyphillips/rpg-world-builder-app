import type {
  OrganizationLocationConnectionFamily,
  OrganizationLocationReferenceResolution,
} from '@rpg/contracts'
import {
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionLabel,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import type { OrganizationLocationConnectionPreviewItem } from './organization-display'

export const ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS: Record<
  OrganizationLocationConnectionFamily,
  string
> = {
  site: 'Site presence',
  geographic_presence: 'Geographic presence',
  territorial_authority: 'Territorial authority',
}

export function buildOrganizationLocationConnectionCards(
  locationReferences: readonly OrganizationLocationReferenceResolution[],
  routeContext: { campaignId: string },
): {
  previewItems: OrganizationLocationConnectionPreviewItem[]
  total: number
} {
  const previewItems = locationReferences.map(({ connection, location }) => {
    const family = getOrganizationLocationConnectionFamily(connection.kind)

    return {
      connectionId: connection.id,
      locationId: connection.locationId,
      kind: connection.kind,
      family,
      familyLabel: ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS[family],
      relationshipLabel: getOrganizationLocationConnectionLabel(connection.kind),
      card: {
        id: connection.locationId,
        name: location?.name ?? 'Unavailable location',
        summary: `${ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS[family]} · ${getOrganizationLocationConnectionLabel(connection.kind)}`,
      },
      detailHref: ROUTES.content.locations.detail(routeContext.campaignId, connection.locationId),
      locationUnavailable: location == null,
    }
  })

  return {
    previewItems,
    total: previewItems.length,
  }
}
