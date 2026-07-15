import {
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionProximityKindLabel,
  getSpellResolutionTargetKindNoun,
  type SpellResolutionTargetKind,
} from './vocab'
import { getSpellAtomicEffectKindLabel } from '../../../vocab/spell/atomic-effect-kind'
import type { ResolutionAvailabilityReason } from './selection-types'

export type ResolutionAvailabilityTone = 'option' | 'hint' | 'dialog' | 'compact'

function methodLabel(method: string): string {
  if (method === 'saving-throw') return 'Saving throw'
  if (method === 'automatic') return 'Automatic'
  return getSpellResolutionAttackTypeLabel(method)
}

function targetPhraseForAvailability(targetKind: SpellResolutionTargetKind): string {
  if (targetKind === 'object') return 'an object'
  if (targetKind === 'creature') return 'a creature'
  return `a ${getSpellResolutionTargetKindNoun(targetKind)}`
}

function formatMethodProximityReason(
  reason: Extract<ResolutionAvailabilityReason, { code: 'method-incompatible-with-proximity' }>,
  tone: ResolutionAvailabilityTone,
): string {
  const method = methodLabel(reason.method)
  const proximity = getSpellResolutionProximityKindLabel(reason.proximity)
  if (tone === 'compact') return `Not available for ${proximity.toLowerCase()}`
  if (tone === 'option') return `Not available when target proximity is ${proximity.toLowerCase()}`
  return `${method} is not available when target proximity is ${proximity.toLowerCase()}.`
}

function formatPatternDistanceReason(
  reason: Extract<ResolutionAvailabilityReason, { code: 'pattern-requires-distance-proximity' }>,
  tone: ResolutionAvailabilityTone,
): string {
  const pattern = getSpellApplicationPatternKindLabel(reason.pattern)
  if (tone === 'compact') return 'Requires distance proximity'
  if (tone === 'option') return 'Requires distance target proximity'
  return `${pattern} requires distance target proximity.`
}

function formatEffectMethodReason(
  reason: Extract<ResolutionAvailabilityReason, { code: 'effect-kind-unsupported-for-method' }>,
  tone: ResolutionAvailabilityTone,
): string {
  const kind = getSpellAtomicEffectKindLabel(reason.kind)
  const method = methodLabel(reason.method)
  if (tone === 'compact') return `Not available for ${method.toLowerCase()}`
  if (tone === 'option') return `Not available with ${method.toLowerCase()} resolution`
  return `${kind} is not available with ${method.toLowerCase()} resolution.`
}

function formatEffectTargetReason(
  reason: Extract<ResolutionAvailabilityReason, { code: 'effect-kind-incompatible-with-target' }>,
  tone: ResolutionAvailabilityTone,
): string {
  const kind = getSpellAtomicEffectKindLabel(reason.kind)
  const target = targetPhraseForAvailability(reason.targetKind)
  if (tone === 'compact')
    return `Not available for ${getSpellResolutionTargetKindNoun(reason.targetKind)} targets`
  if (tone === 'option') return `Not available when the target is ${target}`
  return `${kind} is not available when the target is ${target}.`
}

/** Formats a structured availability reason for UI surfaces. */
export function formatResolutionAvailabilityReason(
  reason: ResolutionAvailabilityReason,
  tone: ResolutionAvailabilityTone,
): string {
  switch (reason.code) {
    case 'method-incompatible-with-proximity':
      return formatMethodProximityReason(reason, tone)
    case 'pattern-requires-distance-proximity':
      return formatPatternDistanceReason(reason, tone)
    case 'effect-kind-unsupported-for-method':
      return formatEffectMethodReason(reason, tone)
    case 'effect-kind-incompatible-with-target':
      return formatEffectTargetReason(reason, tone)
    default: {
      const _exhaustive: never = reason
      return _exhaustive
    }
  }
}
