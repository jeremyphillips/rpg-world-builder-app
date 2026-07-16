import {
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionProximityKindLabel,
} from './vocab'
import { getSpellAtomicEffectKindLabel } from '../../../vocab/spell/atomic-effect-kind'
import type { ResolutionAvailabilityReason } from './selection-types'

export type ResolutionAvailabilityTone = 'option' | 'hint' | 'dialog' | 'compact'

function methodLabel(method: string): string {
  if (method === 'saving-throw') return 'Saving throw'
  if (method === 'automatic') return 'Automatic'
  return getSpellResolutionAttackTypeLabel(method)
}

/** Formats a structured availability reason for UI surfaces. */
export function formatResolutionAvailabilityReason(
  reason: ResolutionAvailabilityReason,
  tone: ResolutionAvailabilityTone,
): string {
  switch (reason.code) {
    case 'method-incompatible-with-proximity': {
      const method = methodLabel(reason.method)
      const proximity = getSpellResolutionProximityKindLabel(reason.proximity)
      if (tone === 'compact') return `Not available for ${proximity.toLowerCase()}`
      if (tone === 'option')
        return `Not available when target proximity is ${proximity.toLowerCase()}`
      return `${method} is not available when target proximity is ${proximity.toLowerCase()}.`
    }
    case 'pattern-requires-distance-proximity': {
      const pattern = getSpellApplicationPatternKindLabel(reason.pattern)
      if (tone === 'compact') return 'Requires distance proximity'
      if (tone === 'option') return 'Requires distance target proximity'
      return `${pattern} requires distance target proximity.`
    }
    case 'effect-kind-unsupported-for-method': {
      const kind = getSpellAtomicEffectKindLabel(reason.kind)
      const method = methodLabel(reason.method)
      if (tone === 'compact') return `Not available for ${method.toLowerCase()}`
      if (tone === 'option') return `Not available with ${method.toLowerCase()} resolution`
      return `${kind} is not available with ${method.toLowerCase()} resolution.`
    }
    default: {
      const _exhaustive: never = reason
      return _exhaustive
    }
  }
}
