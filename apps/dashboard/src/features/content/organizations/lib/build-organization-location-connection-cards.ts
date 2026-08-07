import type {
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
  OrganizationLocationReferenceResolution,
} from '@rpg/contracts'
import {
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionLabel,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import type { OrganizationLocationConnectionPreviewItem } from './organization-display'
import { resolveOrganizationForwardKindHeading } from './organization-location-connection-surface-copy'

export const ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS: Record<
  OrganizationLocationConnectionFamily,
  string
> = {
  site: 'Sites & facilities',
  geographic_presence: 'Geographic presence',
  territorial_authority: 'Territorial authority',
}

export type OrganizationLocationConnectionKindGroup = {
  kind: OrganizationLocationConnectionKind
  kindLabel: string
  items: OrganizationLocationConnectionPreviewItem[]
}

export type OrganizationLocationConnectionFamilyGroup = {
  family: OrganizationLocationConnectionFamily
  familyLabel: string
  kindGroups: OrganizationLocationConnectionKindGroup[]
}

const ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER: OrganizationLocationConnectionFamily[] = [
  'territorial_authority',
  'geographic_presence',
  'site',
]

function kindsForFamily(
  family: OrganizationLocationConnectionFamily,
): OrganizationLocationConnectionKind[] {
  return (
    Object.entries(ORGANIZATION_LOCATION_CONNECTION_ENTRIES) as [
      OrganizationLocationConnectionKind,
      (typeof ORGANIZATION_LOCATION_CONNECTION_ENTRIES)[OrganizationLocationConnectionKind],
    ][]
  )
    .filter(([, entry]) => entry.family === family)
    .sort((a, b) => b[1].priority - a[1].priority)
    .map(([kind]) => kind)
}

export function groupOrganizationLocationConnections(
  previewItems: readonly OrganizationLocationConnectionPreviewItem[],
): OrganizationLocationConnectionFamilyGroup[] {
  const itemsByKind = new Map<
    OrganizationLocationConnectionKind,
    OrganizationLocationConnectionPreviewItem[]
  >()

  for (const item of previewItems) {
    const existing = itemsByKind.get(item.kind) ?? []
    existing.push(item)
    itemsByKind.set(item.kind, existing)
  }

  const familiesWithKinds = new Set<OrganizationLocationConnectionFamily>()
  for (const kind of itemsByKind.keys()) {
    familiesWithKinds.add(getOrganizationLocationConnectionFamily(kind))
  }

  return ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER.filter((family) =>
    familiesWithKinds.has(family),
  ).map((family) => ({
    family,
    familyLabel: ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS[family],
    kindGroups: kindsForFamily(family)
      .filter((kind) => itemsByKind.has(kind))
      .map((kind) => ({
        kind,
        kindLabel: resolveOrganizationForwardKindHeading(kind),
        items: itemsByKind.get(kind) ?? [],
      })),
  }))
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
