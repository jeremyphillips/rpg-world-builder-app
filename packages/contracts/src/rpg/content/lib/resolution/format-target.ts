import { formatAreaGeometry } from '../../../primitives/area-geometry'
import { inferResolutionTargetCountKind } from '../../../vocab/resolution'
import type { ResolutionTargetCountKind } from '../../../vocab/resolution'
import {
  formatAreaOccupantCreaturePhrase,
  formatResolutionTargetProximityPhrase,
  formatResolutionTargetSentence,
  resolutionTargetCountSelectOptions,
  type ResolutionTargetFormatOptions,
} from './format-target-composition'
import type { ResolutionFormatInput, ResolutionTarget } from './schema'

export const RESOLUTION_AFFECTED_AREA_COPY = 'Creatures and objects in the area'

export {
  formatResolutionTargetProximityPhrase,
  resolutionTargetCountSelectOptions,
  type ResolutionTargetFormatOptions,
}

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
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

/** Formats count, kind, proximity, and requirements without method context. */
export function formatResolutionTargetFromParts(
  target: ResolutionTarget,
  options?: ResolutionTargetFormatOptions,
): string {
  return formatResolutionTargetSentence(target, options)
}

/** e.g. "One creature within 60 feet" — targets mode only. */
export function formatResolutionTarget(
  resolution: ResolutionFormatInput,
  options?: ResolutionTargetFormatOptions,
): string {
  if (!resolution.target) return ''
  return formatResolutionTargetFromParts(resolution.target, options)
}

export type ResolutionSelectionSection = {
  heading: string
  lines: string[]
}

export function formatResolutionAffectedAreaCopy(
  resolution: Pick<ResolutionFormatInput, 'occupantRequirements'>,
  options?: ResolutionTargetFormatOptions,
): string {
  const requirements = resolution.occupantRequirements
  if (!requirements?.length) return RESOLUTION_AFFECTED_AREA_COPY
  const phrase = formatAreaOccupantCreaturePhrase(requirements, options)
  return `Each ${phrase} in the area`
}

function areaSections(resolution: ResolutionFormatInput): ResolutionSelectionSection[] {
  if (!resolution.areaOfEffect) return []

  return [
    { heading: 'Area', lines: [formatAreaGeometry(resolution.areaOfEffect)] },
    { heading: 'Affected', lines: [formatResolutionAffectedAreaCopy(resolution)] },
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
