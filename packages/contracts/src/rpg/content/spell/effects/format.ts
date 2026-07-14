import { formatRollValue, type RollValue } from '../../../primitives/mechanics/roll'
import { getDamageTypeLabel } from '../../../vocab/damage/vocabulary'
import { HIT_POINTS_TERM } from '../../../primitives/mechanics/hit-points-term'
import type { EffectRecipient } from './recipient'
import type { SpellAtomicEffect } from './schema'

export type { EffectRecipient }

export type EffectRowFormatOptions = {
  recipient?: EffectRecipient
}

export type EffectRowParts = {
  kind: 'damage' | 'healing' | 'temporary-hit-points'
  roll: RollValue
  damageType?: string
}

function formatDamageRoll(roll: RollValue, damageTypeId: string): string {
  return `${formatRollValue(roll)} ${getDamageTypeLabel(damageTypeId)} damage`
}

function recipientVerb(recipient: EffectRecipient, verb: 'heal' | 'gain'): string {
  if (recipient === 'self') {
    return verb === 'heal' ? 'You heal' : 'You gain'
  }
  if (recipient === 'target') {
    return verb === 'heal' ? 'Target heals' : 'Target gains'
  }
  return verb === 'heal' ? 'Character heals' : 'Character gains'
}

/** Full sentence from effect parts with optional recipient-aware wording. */
export function formatEffectRowSentenceFromParts(
  parts: EffectRowParts,
  options: EffectRowFormatOptions = {},
): string {
  const recipient = options.recipient ?? 'generic'

  switch (parts.kind) {
    case 'damage':
      if (!parts.damageType) return ''
      return `Inflicts ${formatDamageRoll(parts.roll, parts.damageType)}.`
    case 'healing':
      return `${recipientVerb(recipient, 'heal')} ${formatRollValue(parts.roll)} ${HIT_POINTS_TERM.plural}.`
    case 'temporary-hit-points':
      return `${recipientVerb(recipient, 'gain')} ${formatRollValue(parts.roll)} temporary ${HIT_POINTS_TERM.plural}.`
    default:
      return ''
  }
}

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
