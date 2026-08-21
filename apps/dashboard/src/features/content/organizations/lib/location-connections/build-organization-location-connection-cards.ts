import type {
  Location,
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
  OrganizationLocationReferenceResolution,
} from '@rpg/contracts'
import {
  comparePriorityDescending,
  getOrganizationLocationConnectionDisplayLabel,
  getOrganizationLocationConnectionFamily,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import {
  buildLocationEntitySummaryVm,
  buildLocationEntityContextPresentation,
  type LocationEntitySummaryVm,
} from '../../../locations/lib/location-display'
import { ENTITY_UNAVAILABLE_LOCATION_HEADING } from '../../../lib/entity/summary/entity-unavailable-headings.lib'
import type { EntityReplacementCurrentSnapshot } from '../../../lib/entity/surfaces/drawer/replacement/entity-replacement-current.types'
import type { OrganizationLocationConnectionPreviewItem } from '../organization-display'
import {
  ORGANIZATION_FORWARD_FAMILY_PRESENTATION,
  ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER,
} from './organization-location-connection-surface-copy'

export type OrganizationLocationConnectionKindGroup = {
  kind: OrganizationLocationConnectionKind
  kindLabel: string
  items: OrganizationLocationConnectionPreviewItem[]
}

export type OrganizationLocationConnectionFamilyGroup = {
  family: OrganizationLocationConnectionFamily
  familyLabel: string
  kindHeading: 'show' | 'omit'
  kindGroups: OrganizationLocationConnectionKindGroup[]
}

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
    .sort((a, b) => comparePriorityDescending(a[1], b[1]))
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
  ).map((family) => {
    const presentation = ORGANIZATION_FORWARD_FAMILY_PRESENTATION[family]
    return {
      family,
      familyLabel: presentation.heading,
      kindHeading: presentation.kindHeading,
      kindGroups: kindsForFamily(family)
        .filter((kind) => itemsByKind.has(kind))
        .map((kind) => ({
          kind,
          kindLabel: getOrganizationLocationConnectionDisplayLabel(kind, 'forward'),
          items: itemsByKind.get(kind) ?? [],
        })),
    }
  })
}

export function mapLocationEntitySummaryToEntityReplacementCurrentSnapshot(
  vm: LocationEntitySummaryVm,
): EntityReplacementCurrentSnapshot {
  return {
    entity: buildLocationEntityContextPresentation(vm),
    imageKey: vm.imageKey,
  }
}

export function resolveOrganizationForwardCurrentLocationEndpoint(input: {
  connectionId: string
  locationReferences: readonly OrganizationLocationReferenceResolution[]
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
}): EntityReplacementCurrentSnapshot {
  const reference = input.locationReferences.find(
    ({ connection }) => connection.id === input.connectionId,
  )

  if (!reference?.location) {
    return {
      entity: { heading: ENTITY_UNAVAILABLE_LOCATION_HEADING },
      unavailable: true,
    }
  }

  return mapLocationEntitySummaryToEntityReplacementCurrentSnapshot(
    buildLocationEntitySummaryVm(reference.location, {
      locationsById: input.locationsById,
      campaignId: input.campaignId,
    }),
  )
}

export function buildOrganizationLocationConnectionCards(
  locationReferences: readonly OrganizationLocationReferenceResolution[],
  ctx: {
    campaignId: string
    locationsById: ReadonlyMap<string, Location>
  },
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
      target:
        location == null
          ? null
          : buildLocationEntitySummaryVm(location, {
              locationsById: ctx.locationsById,
              campaignId: ctx.campaignId,
              href: ROUTES.content.locations.detail(ctx.campaignId, connection.locationId),
            }),
    }
  })

  return {
    previewItems,
    total: previewItems.length,
  }
}
