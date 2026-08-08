import {
  getLocationKindEntry,
  getParentRequirement,
  resolveLocationClassificationDisplay,
  resolveLocationDetailClassificationFieldLabel,
  resolveLocationDisplaySummary,
  type Location,
  type LocationClassificationDisplay,
  type LocationDisplaySummary,
  type LocationKind,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer-context.types'

import {
  resolveLocationParentReplacementAction,
  type LocationParentReplacementAction,
} from './location-parent-replacement'
import { LOCATION_UNCONTAINED_LABEL } from './location-parent-replacement-surface-copy'

export const LOCATION_UNKNOWN_ANCESTOR_LABEL = 'Unknown location' as const

export const LOCATION_SECTION_LABELS = {
  ancestry: 'Location path',
  children: 'Contained locations',
} as const

export const LOCATION_SECTION_HELPERS = {
  children: 'Locations directly within this location.',
} as const

export const LOCATION_EMPTY_SECTION_TEXT = {
  children: 'No contained locations yet.',
} as const

export const LOCATION_ANCESTRY_TEXT_SEPARATOR = ' / ' as const

export const LOCATED_IN_SUPPORTING_TEXT_PREFIX = 'Located in ' as const

export function formatLocatedInSupportingText(parentName: string): string {
  return `${LOCATED_IN_SUPPORTING_TEXT_PREFIX}${parentName}`
}

export type LocationLocatedInSegment = {
  id: string
  name: string
  href?: string
}

export type LocationAncestorDisplayVm = LocationLocatedInSegment

export type LocationEntitySummaryVm = {
  id: string
  name: string
  href?: string
  imageKey?: string
  classification: LocationClassificationDisplay
  ancestry: {
    items: readonly LocationAncestorDisplayVm[]
    /** Convenience only — never the SSOT for truncation/rich render */
    text: string
  }
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
  locatedInFallbackLabel?: string
  parentReplacementAction: LocationParentReplacementAction
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

export function buildLocationEntitySummaryVm(
  location: Location,
  ctx: {
    locationsById: ReadonlyMap<string, Location>
    campaignId: string
    href?: string
  },
): LocationEntitySummaryVm {
  const items = buildLocationLocatedInSegments(location, ctx.locationsById, ctx.campaignId)

  return {
    id: location.id,
    name: location.name,
    href: ctx.href,
    imageKey: location.imageKey,
    classification: resolveLocationClassificationDisplay(location),
    ancestry: {
      items,
      text: items.map((item) => item.name).join(LOCATION_ANCESTRY_TEXT_SEPARATOR),
    },
  }
}

export function buildLocationEntityContextPresentation(
  vm: LocationEntitySummaryVm,
): DrawerContextEntityPresentation {
  const nearestParent = vm.ancestry.items.at(-1)

  return {
    heading: vm.name,
    headingSuffix: vm.classification.text ? ` · ${vm.classification.text}` : undefined,
    supportingText: nearestParent ? formatLocatedInSupportingText(nearestParent.name) : undefined,
    href: vm.href,
  }
}

export function buildLocationContextPresentationFromLocation(
  location: Location,
  ctx: {
    locationsById: ReadonlyMap<string, Location>
    campaignId: string
    href?: string
  },
): DrawerContextEntityPresentation {
  return buildLocationEntityContextPresentation(buildLocationEntitySummaryVm(location, ctx))
}

export function buildLocationEntitySummarySearchText(vm: LocationEntitySummaryVm): string {
  return [vm.name, ...vm.classification.parts, ...vm.ancestry.items.map((item) => item.name)].join(
    ' ',
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
      summaryLine: resolveLocationClassificationDisplay(location).text,
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
    canManage?: boolean
  },
): LocationDetailViewModel {
  const locationsById = buildLocationsById(ctx.locations)
  const displaySummary = resolveLocationDisplaySummary(location)
  const locatedIn = buildLocationLocatedInSegments(location, locationsById, ctx.campaignId)
  const parentRequirement = getParentRequirement(location.kind)

  return {
    identity: {
      displaySummary,
      rows: buildLocationDetailIdentityRows(location),
      locatedIn,
      locatedInFallbackLabel:
        locatedIn.length === 0 && parentRequirement !== 'forbidden'
          ? LOCATION_UNCONTAINED_LABEL
          : undefined,
      parentReplacementAction: ctx.canManage
        ? resolveLocationParentReplacementAction({ subject: location, canManage: true })
        : null,
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
