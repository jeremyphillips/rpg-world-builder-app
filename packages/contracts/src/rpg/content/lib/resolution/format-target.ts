import { formatAreaGeometry } from '../../../primitives/area-geometry'
import type { ResolutionFormatInput, ResolutionTarget, ResolutionTargetProximity } from './schema'
import { inferResolutionTargetCountKind } from '../../../vocab/resolution'
import {
  type ResolutionTargetCountKind,
  type ResolutionTargetKind,
} from '../../../vocab/resolution'

export const RESOLUTION_AFFECTED_AREA_COPY = 'Creatures and objects in the area'

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
}

function formatTargetCount(count: number, countKind?: ResolutionTargetCountKind): string {
  const kind = inferResolutionTargetCountKind(count, countKind)
  if (kind === 'exact' && count === 1) return 'One'
  if (kind === 'exact') return String(count)
  return `Up to ${count}`
}

function formatTargetKindPhrase(kind: ResolutionTargetKind): string {
  switch (kind) {
    case 'creature':
      return 'creature'
    case 'object':
      return 'object'
    case 'creature-or-object':
      return 'creature or object'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

/** Proximity phrase only — e.g. "you touch" / "within your reach" / "within 60 feet". */
export function formatResolutionTargetProximityPhrase(
  proximity: ResolutionTargetProximity,
): string {
  switch (proximity.kind) {
    case 'touch':
      return 'you touch'
    case 'reach':
      return proximity.distance
        ? `within your reach (${formatDistanceFeet(proximity.distance)})`
        : 'within your reach'
    case 'distance':
      return `within ${formatDistanceFeet(proximity.distance)}`
    default: {
      const _exhaustive: never = proximity
      return _exhaustive
    }
  }
}

function formatOriginDistancePhrase(resolution: ResolutionFormatInput): string {
  const distance = resolution.origin?.proximity.distance
  if (!distance) return 'A point within range'
  return `A point within ${formatDistanceFeet(distance)}`
}

function targetSelectionHeading(count: number, countKind?: ResolutionTargetCountKind): string {
  const kind = inferResolutionTargetCountKind(count, countKind)
  if (kind === 'exact' && count === 1) return 'Target'
  return 'Targets'
}

/** Formats count, kind, and proximity without method context. */
export function formatResolutionTargetFromParts(target: ResolutionTarget): string {
  const { count, countKind, kind, proximity } = target
  return `${formatTargetCount(count, countKind)} ${formatTargetKindPhrase(kind)} ${formatResolutionTargetProximityPhrase(proximity)}`
}

/** e.g. "One creature within 60 feet" — targets mode only. */
export function formatResolutionTarget(resolution: ResolutionFormatInput): string {
  if (!resolution.target) return ''
  return formatResolutionTargetFromParts(resolution.target)
}

export type ResolutionSelectionSection = {
  heading: string
  lines: string[]
}

function areaSections(resolution: ResolutionFormatInput): ResolutionSelectionSection[] {
  if (!resolution.areaOfEffect) return []

  return [
    { heading: 'Area', lines: [formatAreaGeometry(resolution.areaOfEffect)] },
    { heading: 'Affected', lines: [RESOLUTION_AFFECTED_AREA_COPY] },
  ]
}

/** Mode-driven selection preview sections for resolution summary panels. */
export function formatResolutionSelectionSections(
  resolution: ResolutionFormatInput,
): ResolutionSelectionSection[] {
  switch (resolution.selectionMode) {
    case 'none':
      return []
    case 'self':
      if (resolution.areaOfEffect) {
        return [{ heading: 'Origin', lines: ['You'] }, ...areaSections(resolution)]
      }
      return [{ heading: 'Recipient', lines: ['You'] }]
    case 'point':
      return [
        { heading: 'Origin', lines: [formatOriginDistancePhrase(resolution)] },
        ...areaSections(resolution),
      ]
    case 'targets': {
      if (!resolution.target) return []
      return [
        {
          heading: targetSelectionHeading(resolution.target.count, resolution.target.countKind),
          lines: [formatResolutionTargetFromParts(resolution.target)],
        },
      ]
    }
    default: {
      const _exhaustive: never = resolution.selectionMode
      return _exhaustive
    }
  }
}
