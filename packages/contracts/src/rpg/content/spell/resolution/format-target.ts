import { formatAreaGeometry } from '../../../primitives/area-geometry'
import type {
  SpellResolution,
  SpellResolutionExternalTargetProximity,
  SpellResolutionTarget,
} from './schema'
import {
  inferSpellResolutionTargetCountKind,
  type SpellResolutionTargetCountKind,
  type SpellResolutionTargetKind,
} from './vocab'

export const RESOLUTION_AFFECTED_AREA_COPY = 'Creatures and objects in the area'

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
}

function formatTargetCount(count: number, countKind?: SpellResolutionTargetCountKind): string {
  const kind = inferSpellResolutionTargetCountKind(count, countKind)
  if (kind === 'exact' && count === 1) return 'One'
  if (kind === 'exact') return String(count)
  return `Up to ${count}`
}

function formatTargetKindPhrase(kind: SpellResolutionTargetKind): string {
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
  proximity: SpellResolutionExternalTargetProximity,
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

function formatOriginDistancePhrase(resolution: SpellResolution): string {
  const distance = resolution.origin?.proximity.distance
  if (!distance) return 'A point within range'
  return `A point within ${formatDistanceFeet(distance)}`
}

function targetSelectionHeading(count: number, countKind?: SpellResolutionTargetCountKind): string {
  const kind = inferSpellResolutionTargetCountKind(count, countKind)
  if (kind === 'exact' && count === 1) return 'Target'
  return 'Targets'
}

/** Formats count, kind, and proximity without method context. */
export function formatResolutionTargetFromParts(target: SpellResolutionTarget): string {
  const { count, countKind, kind, proximity } = target
  return `${formatTargetCount(count, countKind)} ${formatTargetKindPhrase(kind)} ${formatResolutionTargetProximityPhrase(proximity)}`
}

/** e.g. "One creature within 60 feet" — targets mode only. */
export function formatResolutionTarget(resolution: SpellResolution): string {
  if (!resolution.target) return ''
  return formatResolutionTargetFromParts(resolution.target)
}

export type SpellResolutionSelectionSection = {
  heading: string
  lines: string[]
}

function areaSections(resolution: SpellResolution): SpellResolutionSelectionSection[] {
  if (!resolution.areaOfEffect) return []

  return [
    { heading: 'Area', lines: [formatAreaGeometry(resolution.areaOfEffect)] },
    { heading: 'Affected', lines: [RESOLUTION_AFFECTED_AREA_COPY] },
  ]
}

/** Mode-driven selection preview sections for resolution summary panels. */
export function formatResolutionSelectionSections(
  resolution: SpellResolution,
): SpellResolutionSelectionSection[] {
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

/** @deprecated Proximity is owned by target — use formatResolutionTargetProximityPhrase. */
export function formatResolutionRange(resolution: SpellResolution): string {
  if (!resolution.target) return ''
  return formatResolutionTargetProximityPhrase(resolution.target.proximity)
}
