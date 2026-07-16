import type { SpellResolutionTargetProximity } from '@rpg/contracts'

import type { ResolutionFormValues } from './resolution-form-schema'

export function buildTargetProximity(
  values: ResolutionFormValues,
): SpellResolutionTargetProximity | undefined {
  switch (values.proximityKind) {
    case 'touch':
      return { kind: 'touch' }
    case 'reach':
      return values.proximityReachDistanceFt !== undefined
        ? {
            kind: 'reach',
            distance: { value: values.proximityReachDistanceFt, unit: 'ft' },
          }
        : { kind: 'reach' }
    case 'distance':
      if (values.proximityDistanceFt === undefined) return undefined
      return {
        kind: 'distance',
        distance: { value: values.proximityDistanceFt, unit: 'ft' },
      }
    case 'self':
      return { kind: 'self' }
    default: {
      const _exhaustive: never = values.proximityKind
      return _exhaustive
    }
  }
}

export function applyProximityFields(
  form: ResolutionFormValues,
  proximity: SpellResolutionTargetProximity,
): void {
  if (proximity.kind === 'distance') {
    form.proximityDistanceFt = proximity.distance.value
    return
  }

  if (proximity.kind === 'reach' && proximity.distance) {
    form.proximityReachDistanceFt = proximity.distance.value
  }
}
