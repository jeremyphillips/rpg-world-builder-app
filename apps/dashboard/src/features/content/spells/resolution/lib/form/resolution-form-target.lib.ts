import {
  DEFAULT_RESOLUTION_TARGET,
  inferResolutionTargetCountKind,
  type ResolutionTarget,
  type ResolutionTargetKind,
  type ResolutionTargetProximity,
} from '@rpg/contracts'

import type { ResolutionFormValues } from './resolution-form-schema'

export type ResolutionFormTarget = NonNullable<ResolutionFormValues['target']>

type TargetOverrides = Partial<{
  kind: ResolutionTargetKind
  proximityKind: ResolutionFormTarget['proximity']['kind']
  proximityDistanceFt?: number
  count: number
  countKind: 'exact' | 'up-to'
}>

function proximityWithDistance(
  kind: 'reach' | 'distance',
  distanceFt: number | undefined,
): ResolutionTargetProximity {
  if (distanceFt !== undefined && Number.isFinite(distanceFt) && distanceFt > 0) {
    return { kind, distance: { value: distanceFt, unit: 'ft' } }
  }
  if (kind === 'reach') return { kind: 'reach' }
  return DEFAULT_RESOLUTION_TARGET.proximity
}

function defaultProximityForKind(
  proximityKind: ResolutionFormTarget['proximity']['kind'],
  distanceFt?: number,
): ResolutionTargetProximity {
  if (proximityKind === 'touch') return { kind: 'touch' }
  if (proximityKind === 'reach') return proximityWithDistance('reach', distanceFt)
  return proximityWithDistance('distance', distanceFt ?? 120)
}

export function createDefaultResolutionFormTarget(
  overrides?: TargetOverrides,
): ResolutionFormTarget {
  const proximityKind = overrides?.proximityKind ?? 'touch'
  return {
    count: overrides?.count ?? 1,
    countKind: overrides?.countKind ?? 'exact',
    kind: overrides?.kind ?? 'creature',
    proximity: defaultProximityForKind(proximityKind, overrides?.proximityDistanceFt),
  }
}

export function storedTargetToForm(target: ResolutionTarget): ResolutionFormTarget {
  return {
    count: target.count,
    countKind: target.countKind ?? inferResolutionTargetCountKind(target.count, target.countKind),
    kind: target.kind,
    proximity: target.proximity,
    ...(target.requirements?.length ? { requirements: [...target.requirements] } : {}),
  }
}

export function formTargetToStored(
  target: ResolutionFormTarget | undefined,
): ResolutionTarget | undefined {
  if (!target) return undefined

  const proximity = target.proximity
  if (proximity.kind === 'distance' && !proximity.distance) return undefined

  return {
    count: target.count,
    ...(target.count !== 1 && target.countKind ? { countKind: target.countKind } : {}),
    kind: target.kind,
    proximity,
    ...(Array.isArray(target.requirements) && target.requirements.length > 0
      ? { requirements: target.requirements }
      : {}),
  }
}

export function flatTargetSelectionFields(target: ResolutionFormTarget | undefined): {
  targetCount?: number
  countKind?: ResolutionFormTarget['countKind']
  targetKind?: ResolutionTargetKind
  proximityKind?: ResolutionFormTarget['proximity']['kind']
  proximityDistanceFt?: number
  proximityReachDistanceFt?: number
} {
  if (!target) {
    return {
      targetCount: undefined,
      countKind: undefined,
      targetKind: undefined,
      proximityKind: undefined,
      proximityDistanceFt: undefined,
      proximityReachDistanceFt: undefined,
    }
  }

  const proximity = target.proximity
  return {
    targetCount: target.count,
    countKind: target.countKind,
    targetKind: target.kind,
    proximityKind: proximity.kind,
    proximityDistanceFt: proximity.kind === 'distance' ? proximity.distance?.value : undefined,
    proximityReachDistanceFt: proximity.kind === 'reach' ? proximity.distance?.value : undefined,
  }
}

function proximityAfterFlatPatch(
  base: ResolutionFormTarget,
  patch: ReturnType<typeof flatTargetSelectionFields>,
): ResolutionTargetProximity {
  const proximityKind = patch.proximityKind ?? base.proximity.kind
  if (proximityKind !== base.proximity.kind) {
    return defaultProximityForKind(proximityKind, patch.proximityDistanceFt ?? 60)
  }
  if (proximityKind === 'distance' && patch.proximityDistanceFt !== undefined) {
    return proximityWithDistance('distance', patch.proximityDistanceFt)
  }
  if (proximityKind === 'reach' && patch.proximityReachDistanceFt !== undefined) {
    return proximityWithDistance('reach', patch.proximityReachDistanceFt)
  }
  if (proximityKind === 'reach' && patch.proximityKind === 'reach') {
    return { kind: 'reach' }
  }
  return base.proximity
}

export function applyFlatTargetPatch(
  current: ResolutionFormTarget | undefined,
  patch: ReturnType<typeof flatTargetSelectionFields>,
): ResolutionFormTarget | undefined {
  const base = current ?? createDefaultResolutionFormTarget()
  if (
    patch.targetCount === undefined &&
    patch.targetKind === undefined &&
    patch.proximityKind === undefined
  ) {
    return current
  }

  return {
    count: patch.targetCount ?? base.count,
    countKind: patch.countKind ?? base.countKind,
    kind: (patch.targetKind as ResolutionTargetKind | undefined) ?? base.kind,
    proximity: proximityAfterFlatPatch(base, patch),
    ...(base.requirements?.length ? { requirements: base.requirements } : {}),
  }
}
