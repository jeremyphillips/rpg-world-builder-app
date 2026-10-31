import {
  formatEffectRowSentenceFromParts,
  type EffectRecipient,
  type EffectRowFormatOptions,
  type EffectRowParts,
  type EffectSentenceRegister,
} from '../../lib/resolution/effect-sentence'
import type { SpellAtomicEffect } from './schema'

export type { EffectRecipient, EffectRowFormatOptions, EffectRowParts, EffectSentenceRegister }
export { formatEffectRowSentenceFromParts }

function atomicEffectToParts(effect: SpellAtomicEffect): EffectRowParts | undefined {
  switch (effect.kind) {
    case 'damage':
      return { kind: 'damage', roll: effect.roll, damageType: effect.damageType }
    case 'healing':
      return { kind: 'healing', roll: effect.roll }
    case 'temporary-hit-points':
      return { kind: 'temporary-hit-points', roll: effect.roll }
    case 'projectile-count':
      return undefined
    default: {
      const _exhaustive: never = effect
      return _exhaustive
    }
  }
}

/**
 * Full sentence for an effect array item summary (grant-style authoring headers).
 * Returns empty string when required fields for the kind are absent.
 */
export function formatEffectRowSentence(
  effect: SpellAtomicEffect,
  options: EffectRowFormatOptions = {},
): string {
  if (effect.kind === 'projectile-count') {
    return `Creates ${effect.count} ${effect.unitLabel}.`
  }

  const parts = atomicEffectToParts(effect)
  if (!parts) return ''
  return formatEffectRowSentenceFromParts(parts, options)
}
