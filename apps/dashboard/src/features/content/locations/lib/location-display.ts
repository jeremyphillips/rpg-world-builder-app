import {
  getInteriorClassificationLabel,
  getLocationKindEntry,
  getLocationKindLabel,
  getPlaneTypeLabel,
  getRegionClassificationLabel,
  getSettlementTypeLabel,
  getSiteTypeLabel,
  getStructureClassificationLabel,
  type Location,
  type LocationKind,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export const LOCATION_SECTION_LABELS = {
  ancestry: 'Location path',
  children: 'Contained locations',
} as const

export const LOCATION_EMPTY_SECTION_TEXT = {
  children: 'No contained locations yet.',
} as const

export type LocationAncestrySegment = {
  id: string
  name: string
  href: string
}

export type LocationChildItem = {
  id: string
  name: string
  kindLabel: string
  href: string
}

export type LocationChildrenViewModel = {
  items: LocationChildItem[]
  emptyText: string
}

export type LocationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  ancestry: LocationAncestrySegment[]
  children: LocationChildrenViewModel
}

const subtypeLabelByKind: Partial<
  Record<LocationKind, (location: Location) => string | undefined>
> = {
  plane: (location) =>
    location.kind === 'plane' && location.planeType
      ? getPlaneTypeLabel(location.planeType)
      : undefined,
  region: (location) =>
    location.kind === 'region' && location.classification
      ? getRegionClassificationLabel(location.classification)
      : undefined,
  settlement: (location) =>
    location.kind === 'settlement' && location.settlementType
      ? getSettlementTypeLabel(location.settlementType)
      : undefined,
  site: (location) =>
    location.kind === 'site' && location.siteType ? getSiteTypeLabel(location.siteType) : undefined,
  structure: (location) =>
    location.kind === 'structure'
      ? getStructureClassificationLabel({
          structureType: location.structureType,
          classification: location.classification,
        })
      : undefined,
  interior: (location) =>
    location.kind === 'interior'
      ? getInteriorClassificationLabel({
          interiorType: location.interiorType,
          classification: location.classification,
        })
      : undefined,
}

function getLocationSubtypeLabel(location: Location): string | undefined {
  return subtypeLabelByKind[location.kind]?.(location)
}

export function buildLocationsById(locations: readonly Location[]): Map<string, Location> {
  return new Map(locations.map((location) => [location.id, location]))
}

export function buildLocationAncestrySegments(
  location: Location,
  locationsById: ReadonlyMap<string, Location>,
  campaignId: string,
): LocationAncestrySegment[] {
  const segments: LocationAncestrySegment[] = []
  const visited = new Set<string>([location.id])
  let current: Location | undefined = location

  while (current?.parentLocationId) {
    const parentId = current.parentLocationId
    if (visited.has(parentId)) break
    visited.add(parentId)

    const parent = locationsById.get(parentId)
    if (!parent) break

    segments.unshift({
      id: parent.id,
      name: parent.name,
      href: ROUTES.content.locations.detail(campaignId, parent.id),
    })
    current = parent
  }

  return segments
}

export function buildLocationChildren(
  locationId: string,
  locations: readonly Location[],
  campaignId: string,
): LocationChildItem[] {
  return locations
    .filter((location) => location.parentLocationId === locationId)
    .map((location) => ({
      id: location.id,
      name: location.name,
      kindLabel: getLocationKindLabel(location.kind),
      href: ROUTES.content.locations.detail(campaignId, location.id),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function buildLocationDetailViewModel(
  location: Location,
  ctx: {
    locations: readonly Location[]
    campaignId: string
  },
): LocationDetailViewModel {
  const locationsById = buildLocationsById(ctx.locations)
  const parent = location.parentLocationId
    ? locationsById.get(location.parentLocationId)
    : undefined
  const kindLabel = getLocationKindLabel(location.kind)
  const subtypeLabel = getLocationSubtypeLabel(location)

  const statRows: ContentStatRowData[] = [
    {
      label: 'Kind',
      value: kindLabel,
      info: getLocationKindEntry(location.kind)?.description,
      infoAriaLabel: `About ${kindLabel}`,
    },
  ]

  if (subtypeLabel) {
    statRows.push({ label: 'Subtype', value: subtypeLabel })
  }

  if (parent) {
    statRows.push({ label: 'Parent', value: parent.name })
  }

  return {
    statRows,
    description: location.description,
    ancestry: buildLocationAncestrySegments(location, locationsById, ctx.campaignId),
    children: {
      items: buildLocationChildren(location.id, ctx.locations, ctx.campaignId),
      emptyText: LOCATION_EMPTY_SECTION_TEXT.children,
    },
  }
}

export function visibleForLocationKind(kind: LocationKind) {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched: Record<string, unknown>) => watched['kind'] === kind,
  }
}
