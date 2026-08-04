import {
  formatLocationDisplaySummary,
  getLocationKindEntry,
  INTERIOR_TYPE_DEFINITIONS,
  resolveLocationDisplaySummary,
  type Location,
  type LocationDisplaySummary,
  type LocationKind,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export const LOCATION_UNKNOWN_ANCESTOR_LABEL = 'Unknown location' as const

export const LOCATION_SECTION_LABELS = {
  ancestry: 'Location path',
  children: 'Contained locations',
} as const

export const LOCATION_EMPTY_SECTION_TEXT = {
  children: 'No contained locations yet.',
} as const

/** @deprecated Use LocationLocatedInSegment — kept for LocationAncestry stories. */
export type LocationAncestrySegment = {
  id: string
  name: string
  href: string
}

export type LocationLocatedInSegment = {
  id: string
  name: string
  href?: string
}

export type LocationDetailIdentityRow = {
  label: string
  value: string
  info?: string
  infoAriaLabel?: string
}

export type LocationDetailIdentityViewModel = {
  displaySummary: LocationDisplaySummary
  rows: LocationDetailIdentityRow[]
  locatedIn: LocationLocatedInSegment[]
}

export type LocationChildItem = {
  id: string
  name: string
  href: string
  summaryLine: string
}

export type LocationChildrenViewModel = {
  items: LocationChildItem[]
  emptyText: string
}

export type LocationDetailViewModel = {
  identity: LocationDetailIdentityViewModel
  description?: string
  children: LocationChildrenViewModel
}

export function resolveLocationDetailClassificationFieldLabel(
  location: Location,
): string | undefined {
  switch (location.kind) {
    case 'structure':
      return location.structureType === 'building' ? 'Archetype' : undefined
    case 'settlement':
    case 'region':
      return 'Classification'
    case 'site':
      return 'Site type'
    case 'plane':
      return 'Plane type'
    case 'interior': {
      const interiorType = location.interiorType
      if (interiorType && interiorType in INTERIOR_TYPE_DEFINITIONS) {
        return `${INTERIOR_TYPE_DEFINITIONS[interiorType as keyof typeof INTERIOR_TYPE_DEFINITIONS].label} type`
      }
      return 'Interior type'
    }
    default:
      return undefined
  }
}

export function resolveLocationDetailSpecializationFieldLabel(
  location: Location,
): 'Specialization' | undefined {
  const summary = resolveLocationDisplaySummary(location)
  return summary.specializationLabel ? 'Specialization' : undefined
}

function buildLocationDetailIdentityRows(location: Location): LocationDetailIdentityRow[] {
  const summary = resolveLocationDisplaySummary(location)
  const rows: LocationDetailIdentityRow[] = [
    {
      label: 'Type',
      value: summary.typeLabel,
      info: getLocationKindEntry(location.kind)?.description,
      infoAriaLabel: `About ${summary.typeLabel}`,
    },
  ]

  const classificationFieldLabel = resolveLocationDetailClassificationFieldLabel(location)
  if (classificationFieldLabel && summary.classificationLabel) {
    rows.push({
      label: classificationFieldLabel,
      value: summary.classificationLabel,
    })
  }

  const specializationFieldLabel = resolveLocationDetailSpecializationFieldLabel(location)
  if (specializationFieldLabel && summary.specializationLabel) {
    rows.push({
      label: specializationFieldLabel,
      value: summary.specializationLabel,
    })
  }

  return rows
}

export function buildLocationsById(locations: readonly Location[]): Map<string, Location> {
  return new Map(locations.map((location) => [location.id, location]))
}

export function buildLocationLocatedInSegments(
  location: Location,
  locationsById: ReadonlyMap<string, Location>,
  campaignId: string,
): LocationLocatedInSegment[] {
  const segments: LocationLocatedInSegment[] = []
  const visited = new Set<string>([location.id])
  let current: Location | undefined = location

  while (current?.parentLocationId) {
    const parentId = current.parentLocationId
    if (visited.has(parentId)) break
    visited.add(parentId)

    const parent = locationsById.get(parentId)
    if (!parent) {
      segments.unshift({
        id: parentId,
        name: LOCATION_UNKNOWN_ANCESTOR_LABEL,
      })
      break
    }

    segments.unshift({
      id: parent.id,
      name: parent.name,
      href: ROUTES.content.locations.detail(campaignId, parent.id),
    })
    current = parent
  }

  return segments
}

/** @deprecated Use buildLocationLocatedInSegments. */
export function buildLocationAncestrySegments(
  location: Location,
  locationsById: ReadonlyMap<string, Location>,
  campaignId: string,
): LocationAncestrySegment[] {
  return buildLocationLocatedInSegments(location, locationsById, campaignId).flatMap((segment) =>
    segment.href ? [{ id: segment.id, name: segment.name, href: segment.href }] : [],
  )
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
      href: ROUTES.content.locations.detail(campaignId, location.id),
      summaryLine: formatLocationDisplaySummary(resolveLocationDisplaySummary(location)),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export type LocationChildSummaryItem = {
  id: string
  label: string
}

export function buildChildSummariesByParentId(
  locations: readonly Location[],
): Map<string, LocationChildSummaryItem[]> {
  const summaries = new Map<string, LocationChildSummaryItem[]>()

  for (const location of locations) {
    const parentId = location.parentLocationId
    if (!parentId) continue

    const bucket = summaries.get(parentId) ?? []
    bucket.push({ id: location.id, label: location.name })
    summaries.set(parentId, bucket)
  }

  for (const [parentId, items] of summaries) {
    summaries.set(
      parentId,
      [...items].sort((left, right) => left.label.localeCompare(right.label)),
    )
  }

  return summaries
}

export function buildChildCountByParentId(locations: readonly Location[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const [parentId, items] of buildChildSummariesByParentId(locations)) {
    counts.set(parentId, items.length)
  }

  return counts
}

export function buildLocationDetailViewModel(
  location: Location,
  ctx: {
    locations: readonly Location[]
    campaignId: string
  },
): LocationDetailViewModel {
  const locationsById = buildLocationsById(ctx.locations)
  const displaySummary = resolveLocationDisplaySummary(location)

  return {
    identity: {
      displaySummary,
      rows: buildLocationDetailIdentityRows(location),
      locatedIn: buildLocationLocatedInSegments(location, locationsById, ctx.campaignId),
    },
    description: location.description,
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
