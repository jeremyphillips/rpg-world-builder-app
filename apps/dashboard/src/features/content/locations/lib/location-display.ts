import {
  getLocationKindEntry,
  getParentRequirement,
  resolveLocationClassificationDisplay,
  resolveLocationDetailClassificationFieldLabel,
  resolveLocationDisplaySummary,
  resolveLocationStructureHeadingNoun,
  type Location,
  type LocationClassificationDisplay,
  type LocationDisplaySummary,
  type LocationKind,
} from '@rpg/contracts'

import { formatDescriptorCount } from '@/lib/actions'

import { ROUTES } from '@/app/routes'

import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer/drawer-context.types'

import type { LocationAuthoringType } from './location-authoring-type'
import { resolveRegionRelationshipLabelPlural } from './location-contextual-terminology.lib'
import { childAuthoringTypesForParentKind } from './create/location-create-shortcuts'
import {
  resolveLocationParentReplacementAction,
  type LocationParentReplacementAction,
} from './hierarchy/location-parent-replacement'
import { LOCATION_UNCONTAINED_LABEL } from './hierarchy/location-parent-replacement-surface-copy'
import {
  formatLocationStructureSplitCount,
  partitionLocationsByStructureGroup,
  resolveLocationStructureProfile,
  type LocationStructureGroupId,
  type LocationStructureGroupProfile,
} from './location-structure.lib'

export const LOCATION_UNKNOWN_ANCESTOR_LABEL = 'Unknown location' as const

export const LOCATION_SECTION_LABELS = {
  ancestry: 'Location path',
} as const

export const LOCATION_SECTION_HELPERS = {
  worldStructure: 'Regions and locations organized within this world.',
  regionStructure: 'Subregions and locations organized within this region.',
  settlementStructure: 'Districts and locations organized within this settlement.',
  districtStructure: 'Locations organized within this district.',
  siteStructure: 'Locations organized within this site.',
  structureStructure: 'Locations organized within this structure.',
  interiorStructure: 'Locations organized within this interior.',
  genericStructure: 'Locations organized within this location.',
} as const

export const LOCATION_EMPTY_SECTION_TEXT = {
  children: 'No locations yet.',
  districts: 'No districts yet.',
  regions: 'No regions yet.',
  subregions: 'No subregions yet.',
  directLocations: 'No direct locations yet.',
} as const

export const LOCATION_CHILDREN_GROUP_LABELS = {
  districts: 'Districts',
  regions: 'Regions',
  subregions: 'Subregions',
  directLocations: 'Direct locations',
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

/**
 * One Structure row. When `disclosure` is true, the row may expand to `children`
 * (subject to `maxInlineDepth` already applied when building the VM).
 */
export type LocationStructureRowVm = {
  item: LocationChildItem
  kind: LocationKind
  /** Preformatted immediate-child count phrase (split or single), when any. */
  countPhrase?: string
  /** When true, render a disclosure chevron; when false at depth cap, counts only. */
  disclosure: boolean
  children: LocationStructureRowVm[]
  /** Parent kind for this row's children (this row's kind) — drives Subregion counts. */
  childParentKind: LocationKind
  /** Add-child menu under this row when structural (district/region). */
  canAddChildren: boolean
}

export type LocationChildrenGroup = {
  id: LocationStructureGroupId
  label: string
  emptyText: string
  /** Flat rows when the group is not expandable (e.g. directLocations). */
  items: LocationChildItem[]
  /** Expandable structural rows (districts / regions / subregions). */
  expandableItems?: LocationStructureRowVm[]
  /** Structural authoring type for the group header Add action, when applicable. */
  structuralAuthoringType?: LocationAuthoringType
  maxInlineDepth: number
}

export const LOCATION_CHILD_COUNT_DESCRIPTOR = {
  nounSingular: 'location',
  nounPlural: 'locations',
} as const

export function formatLocationChildCount(count: number): string {
  return formatDescriptorCount(count, LOCATION_CHILD_COUNT_DESCRIPTOR)
}

function formatCountWithNoun(count: number, nounSingular: string, nounPlural: string): string {
  return formatDescriptorCount(count, { nounSingular, nounPlural })
}

export type LocationChildrenViewModel = {
  heading: string
  helper: string
  items: LocationChildItem[]
  groups?: LocationChildrenGroup[]
  emptyText: string
}

export type LocationDetailViewModel = {
  identity: LocationDetailIdentityViewModel
  description?: string
  children: LocationChildrenViewModel
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

  if (summary.buildingFormLabel) {
    rows.push({ label: 'Form', value: summary.buildingFormLabel })
  }

  if (summary.buildingFacilityTypeLabel) {
    rows.push({ label: 'Facility type', value: summary.buildingFacilityTypeLabel })
  }

  const classificationFieldLabel = resolveLocationDetailClassificationFieldLabel(location)
  if (classificationFieldLabel && summary.classificationLabel) {
    rows.push({
      label: classificationFieldLabel,
      value: summary.classificationLabel,
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
    .map((location) => toLocationChildItem(location, campaignId))
    .sort((left, right) => left.name.localeCompare(right.name))
}

function toLocationChildItem(location: Location, campaignId: string): LocationChildItem {
  return {
    id: location.id,
    name: location.name,
    href: ROUTES.content.locations.detail(campaignId, location.id),
    summaryLine: resolveLocationClassificationDisplay(location).text,
  }
}

export function buildChildrenByParentId(locations: readonly Location[]): Map<string, Location[]> {
  const childrenByParentId = new Map<string, Location[]>()

  for (const location of locations) {
    const parentId = location.parentLocationId
    if (!parentId) continue

    const bucket = childrenByParentId.get(parentId) ?? []
    bucket.push(location)
    childrenByParentId.set(parentId, bucket)
  }

  for (const [parentId, children] of childrenByParentId) {
    childrenByParentId.set(
      parentId,
      [...children].sort((left, right) => left.name.localeCompare(right.name)),
    )
  }

  return childrenByParentId
}

function resolveStructureHelper(location: Location): string {
  switch (location.kind) {
    case 'world':
      return LOCATION_SECTION_HELPERS.worldStructure
    case 'region':
      return LOCATION_SECTION_HELPERS.regionStructure
    case 'settlement': {
      const noun = resolveLocationStructureHeadingNoun(location).toLowerCase()
      return `Districts and locations organized within this ${noun}.`
    }
    case 'district':
      return LOCATION_SECTION_HELPERS.districtStructure
    case 'site': {
      const noun = resolveLocationStructureHeadingNoun(location).toLowerCase()
      return `Locations organized within this ${noun}.`
    }
    case 'structure': {
      const noun = resolveLocationStructureHeadingNoun(location).toLowerCase()
      return `Locations organized within this ${noun}.`
    }
    case 'interior': {
      const noun = resolveLocationStructureHeadingNoun(location).toLowerCase()
      return `Locations organized within this ${noun}.`
    }
    default:
      return LOCATION_SECTION_HELPERS.genericStructure
  }
}

function formatStructureHeading(location: Location): string {
  return `${resolveLocationStructureHeadingNoun(location)} structure`
}

function resolveGroupLabel(groupId: LocationStructureGroupId, parentKind: LocationKind): string {
  if (groupId === 'regions' || groupId === 'subregions') {
    return resolveRegionRelationshipLabelPlural(parentKind)
  }
  return LOCATION_CHILDREN_GROUP_LABELS[groupId]
}

function resolveGroupEmptyText(groupId: LocationStructureGroupId): string {
  switch (groupId) {
    case 'districts':
      return LOCATION_EMPTY_SECTION_TEXT.districts
    case 'regions':
      return LOCATION_EMPTY_SECTION_TEXT.regions
    case 'subregions':
      return LOCATION_EMPTY_SECTION_TEXT.subregions
    case 'directLocations':
      return LOCATION_EMPTY_SECTION_TEXT.directLocations
  }
}

function buildCountPhraseForRow(
  location: Location,
  immediateChildren: readonly Location[],
): string | undefined {
  if (location.kind === 'region') {
    const phrase = formatLocationStructureSplitCount(
      immediateChildren,
      location.kind,
      formatCountWithNoun,
    )
    return phrase || undefined
  }

  // Districts and other expandable structural rows keep an explicit zero count for gutter parity.
  return formatLocationChildCount(immediateChildren.length)
}

/**
 * Builds nested Structure rows. `depth` is the nested row level below the surface (1-based).
 * Disclosure is allowed while `depth <= maxInlineDepth`.
 */
function buildStructureRowVm(
  location: Location,
  childrenByParentId: ReadonlyMap<string, Location[]>,
  campaignId: string,
  depth: number,
  groupProfile: LocationStructureGroupProfile,
): LocationStructureRowVm {
  const immediateChildren = childrenByParentId.get(location.id) ?? []
  const withinDepth = depth <= groupProfile.maxInlineDepth
  const countPhrase = buildCountPhraseForRow(location, immediateChildren)

  const childRows: LocationStructureRowVm[] = withinDepth
    ? immediateChildren.map((child) => {
        const childIsStructural =
          groupProfile.childKind !== undefined && child.kind === groupProfile.childKind
        const childDepth = depth + 1

        if (childIsStructural && groupProfile.expandable) {
          return buildStructureRowVm(
            child,
            childrenByParentId,
            campaignId,
            childDepth,
            groupProfile,
          )
        }

        return {
          item: toLocationChildItem(child, campaignId),
          kind: child.kind,
          disclosure: false,
          children: [],
          childParentKind: location.kind,
          canAddChildren: false,
          countPhrase:
            childIsStructural && childDepth > groupProfile.maxInlineDepth
              ? buildCountPhraseForRow(child, childrenByParentId.get(child.id) ?? [])
              : undefined,
        }
      })
    : []

  return {
    item: toLocationChildItem(location, campaignId),
    kind: location.kind,
    countPhrase,
    disclosure: withinDepth && immediateChildren.length > 0,
    children: childRows,
    childParentKind: location.kind,
    canAddChildren: childAuthoringTypesForParentKind(location.kind).length > 0,
  }
}

function buildGroupedStructureViewModel(
  location: Location,
  locations: readonly Location[],
  campaignId: string,
): LocationChildrenViewModel {
  const profile = resolveLocationStructureProfile(location.kind)
  if (!profile) {
    return buildFlatStructureViewModel(location, locations, campaignId)
  }

  const childrenByParentId = buildChildrenByParentId(locations)
  const childLocations = childrenByParentId.get(location.id) ?? []
  const buckets = partitionLocationsByStructureGroup(childLocations, profile)

  const groups = profile.groups.map((groupProfile) => {
    const groupLocations = buckets[groupProfile.id] ?? []

    if (groupProfile.expandable && groupProfile.childKind) {
      return {
        id: groupProfile.id,
        label: resolveGroupLabel(groupProfile.id, location.kind),
        emptyText: resolveGroupEmptyText(groupProfile.id),
        items: [] as LocationChildItem[],
        expandableItems: groupLocations.map((entry) =>
          buildStructureRowVm(entry, childrenByParentId, campaignId, 1, groupProfile),
        ),
        structuralAuthoringType: groupProfile.childKind as LocationAuthoringType,
        maxInlineDepth: groupProfile.maxInlineDepth,
      } satisfies LocationChildrenGroup
    }

    return {
      id: groupProfile.id,
      label: resolveGroupLabel(groupProfile.id, location.kind),
      emptyText: resolveGroupEmptyText(groupProfile.id),
      items: groupLocations.map((entry) => toLocationChildItem(entry, campaignId)),
      maxInlineDepth: groupProfile.maxInlineDepth,
    } satisfies LocationChildrenGroup
  })

  return {
    heading: formatStructureHeading(location),
    helper: resolveStructureHelper(location),
    items: [],
    groups,
    emptyText: LOCATION_EMPTY_SECTION_TEXT.children,
  }
}

function buildFlatStructureViewModel(
  location: Location,
  locations: readonly Location[],
  campaignId: string,
): LocationChildrenViewModel {
  return {
    heading: formatStructureHeading(location),
    helper: resolveStructureHelper(location),
    items: buildLocationChildren(location.id, locations, campaignId),
    emptyText: LOCATION_EMPTY_SECTION_TEXT.children,
  }
}

function buildLocationChildrenViewModel(
  location: Location,
  locations: readonly Location[],
  campaignId: string,
): LocationChildrenViewModel {
  if (resolveLocationStructureProfile(location.kind)) {
    return buildGroupedStructureViewModel(location, locations, campaignId)
  }

  return buildFlatStructureViewModel(location, locations, campaignId)
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
    children: buildLocationChildrenViewModel(location, ctx.locations, ctx.campaignId),
  }
}

export function visibleForLocationKind(kind: LocationKind) {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched: Record<string, unknown>) => watched['kind'] === kind,
  }
}
