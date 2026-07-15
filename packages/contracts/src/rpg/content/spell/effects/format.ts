import { formatRollValue, type RollValue } from '../../../primitives/mechanics/roll'
import { getDamageTypeLabel } from '../../../vocab/damage/vocabulary'
import { HIT_POINTS_TERM } from '../../../primitives/mechanics/hit-points-term'
import type { SpellResolutionTargetKind } from '../resolution/vocab'
import type { EffectRecipient } from './recipient'
import type { SpellAtomicEffect } from './schema'

export type { EffectRecipient }

export type EffectSentenceRegister = 'authoring' | 'resolution-preview'

export type EffectRowFormatOptions = {
  recipient?: EffectRecipient
  targetKind?: SpellResolutionTargetKind
  /** Authoring rows vs player-facing resolution preview copy. */
  register?: EffectSentenceRegister
  applicationAmount?: 'full' | 'half'
}

export type EffectRowParts = {
  kind: 'damage' | 'healing' | 'temporary-hit-points'
  roll: RollValue
  damageType?: string
}

function formatDamageRoll(roll: RollValue, damageTypeId: string, lowercaseType = false): string {
  const typeLabel = lowercaseType
    ? getDamageTypeLabel(damageTypeId).toLowerCase()
    : getDamageTypeLabel(damageTypeId)
  return `${formatRollValue(roll)} ${typeLabel} damage`
}

function hitPointsLabel(register: EffectSentenceRegister, plural: boolean): string {
  if (register === 'resolution-preview') {
    return plural ? 'hit points' : 'hit point'
  }
  return plural ? HIT_POINTS_TERM.plural : HIT_POINTS_TERM.singular
}

function previewSubject(recipient: EffectRecipient): string {
  if (recipient === 'self') return 'You'
  if (recipient === 'target') return 'Target'
  return 'The target'
}

function recipientVerb(
  recipient: EffectRecipient,
  verb: 'heal' | 'gain',
  targetKind?: SpellResolutionTargetKind,
): string {
  if (recipient === 'self') {
    return verb === 'heal' ? 'You heal' : 'You gain'
  }
  if (recipient === 'target') {
    const subject = targetKind === 'creature' ? ' creature' : ''
    return verb === 'heal' ? `Target${subject} heals` : `Target${subject} gains`
  }
  return verb === 'heal' ? 'Character heals' : 'Character gains'
}

function formatAuthoringDamageSentence(parts: EffectRowParts): string {
  if (!parts.damageType) return ''
  return `Inflicts ${formatDamageRoll(parts.roll, parts.damageType)}.`
}

function formatPreviewDamageSentence(
  parts: EffectRowParts,
  recipient: EffectRecipient,
  applicationAmount?: 'full' | 'half',
): string {
  if (!parts.damageType) return ''
  if (applicationAmount === 'half') {
    return `${previewSubject(recipient)} takes half as much damage.`
  }
  return `${previewSubject(recipient)} takes ${formatDamageRoll(parts.roll, parts.damageType, true)}.`
}

function formatAuthoringHealingSentence(
  parts: EffectRowParts,
  recipient: EffectRecipient,
  targetKind?: SpellResolutionTargetKind,
): string {
  return `${recipientVerb(recipient, 'heal', targetKind)} ${formatRollValue(parts.roll)} ${HIT_POINTS_TERM.plural}.`
}

function formatPreviewHealingSentence(parts: EffectRowParts, recipient: EffectRecipient): string {
  const verb = recipient === 'self' ? 'You regain' : `${previewSubject(recipient)} regains`
  return `${verb} ${formatRollValue(parts.roll)} ${hitPointsLabel('resolution-preview', true)}.`
}

function formatAuthoringTemporaryHitPointsSentence(
  parts: EffectRowParts,
  recipient: EffectRecipient,
  targetKind?: SpellResolutionTargetKind,
): string {
  return `${recipientVerb(recipient, 'gain', targetKind)} ${formatRollValue(parts.roll)} temporary ${HIT_POINTS_TERM.plural}.`
}

function formatPreviewTemporaryHitPointsSentence(
  parts: EffectRowParts,
  recipient: EffectRecipient,
): string {
  const verb = recipient === 'self' ? 'You gain' : `${previewSubject(recipient)} gains`
  return `${verb} ${formatRollValue(parts.roll)} temporary ${hitPointsLabel('resolution-preview', true)}.`
}

/** Full sentence from effect parts with optional recipient-aware wording. */
export function formatEffectRowSentenceFromParts(
  parts: EffectRowParts,
  options: EffectRowFormatOptions = {},
): string {
  const recipient = options.recipient ?? 'generic'
  const register = options.register ?? 'authoring'

  switch (parts.kind) {
    case 'damage':
      if (register === 'resolution-preview') {
        return formatPreviewDamageSentence(parts, recipient, options.applicationAmount)
      }
      return formatAuthoringDamageSentence(parts)
    case 'healing':
      if (register === 'resolution-preview') {
        return formatPreviewHealingSentence(parts, recipient)
      }
      return formatAuthoringHealingSentence(parts, recipient, options.targetKind)
    case 'temporary-hit-points':
      if (register === 'resolution-preview') {
        return formatPreviewTemporaryHitPointsSentence(parts, recipient)
      }
      return formatAuthoringTemporaryHitPointsSentence(parts, recipient, options.targetKind)
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
