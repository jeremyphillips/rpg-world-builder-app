import type {
  SpellResolution,
  SpellResolutionTarget,
  SpellResolutionTargetProximity,
} from './schema'
import { getSpellResolutionTargetKindLabel } from './vocab'

function formatTargetCount(count: number): string {
  if (count === 1) return 'One'
  return String(count)
}

function formatTargetKindPhrase(kind: SpellResolution['target']['kind']): string {
  switch (kind) {
    case 'creature':
      return 'creature'
    case 'object':
      return 'object'
    case 'creature-or-object':
      return 'creature or object'
    default: {
      return getSpellResolutionTargetKindLabel(kind)
    }
  }
}

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
}

/** Proximity phrase only — e.g. "you touch" / "within your reach" / "within 60 feet". */
export function formatResolutionTargetProximityPhrase(
  proximity: SpellResolutionTargetProximity,
): string {
  switch (proximity.kind) {
    case 'self':
      return 'yourself'
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

/** e.g. "One creature within 60 feet" */
export function formatResolutionTarget(resolution: SpellResolution): string {
  return formatResolutionTargetFromParts(resolution.target)
}

/** Formats count, kind, and proximity without method context. */
export function formatResolutionTargetFromParts(target: SpellResolutionTarget): string {
  const { count, kind, proximity } = target
  return `${formatTargetCount(count)} ${formatTargetKindPhrase(kind)} ${formatResolutionTargetProximityPhrase(proximity)}`
}

/** @deprecated Proximity is owned by target — use formatResolutionTargetProximityPhrase. */
export function formatResolutionRange(resolution: SpellResolution): string {
  return formatResolutionTargetProximityPhrase(resolution.target.proximity)
}
