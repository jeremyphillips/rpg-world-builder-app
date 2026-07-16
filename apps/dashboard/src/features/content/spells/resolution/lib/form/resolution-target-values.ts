import type { SpellResolutionTarget } from '@rpg/contracts'

import type { ResolutionFormValues } from './resolution-form-schema'

type ExternalTargetProximity = SpellResolutionTarget['proximity']

export function buildTargetProximity(
  values: ResolutionFormValues,
): ExternalTargetProximity | undefined {
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
    default: {
      const _exhaustive: never = values.proximityKind
      return _exhaustive
    }
  }
}

export function applyProximityFields(
  form: ResolutionFormValues,
  proximity: ExternalTargetProximity,
): void {
  if (proximity.kind === 'distance') {
    form.proximityDistanceFt = proximity.distance.value
    return
  }

  if (proximity.kind === 'reach' && proximity.distance) {
    form.proximityReachDistanceFt = proximity.distance.value
  }
}
