import { formatRollValue } from '../../../primitives/mechanics/roll'
import { formatDamageValue } from '../effects/display'
import { formatEffectRowSentenceFromParts } from '../effects/format'
import { deriveDefaultEffectRecipient } from './effect-context'
import type {
  SpellResolution,
  SpellResolutionDamageEffect,
  SpellResolutionHealingEffect,
  SpellResolutionTemporaryHitPointsEffect,
} from './schema'

export function findResolutionDamageEffects(
  resolution: SpellResolution,
): SpellResolutionDamageEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionDamageEffect => effect.kind === 'damage',
  )
}

export function findResolutionHealingEffects(
  resolution: SpellResolution,
): SpellResolutionHealingEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionHealingEffect => effect.kind === 'healing',
  )
}

export function findResolutionTemporaryHitPointsEffects(
  resolution: SpellResolution,
): SpellResolutionTemporaryHitPointsEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionTemporaryHitPointsEffect =>
      effect.kind === 'temporary-hit-points',
  )
}

/** e.g. "2d8 healing" or recipient-aware sentence in summary sections. */
export function formatResolutionHealing(resolution: SpellResolution): string {
  const healing = findResolutionHealingEffects(resolution)[0]
  if (!healing) return ''
  const recipient = deriveDefaultEffectRecipient({
    proximityKind: resolution.target.proximity.kind,
    targetKind: resolution.target.kind,
    targetCount: resolution.target.count,
  })
  return formatEffectRowSentenceFromParts(
    { kind: 'healing', roll: healing.roll },
    { recipient },
  ).replace(/\.$/, '')
}

/** e.g. "2d4+4 temporary hit points" or recipient-aware sentence. */
export function formatResolutionTemporaryHitPoints(resolution: SpellResolution): string {
  const temporaryHitPoints = findResolutionTemporaryHitPointsEffects(resolution)[0]
  if (!temporaryHitPoints) return ''
  const recipient = deriveDefaultEffectRecipient({
    proximityKind: resolution.target.proximity.kind,
    targetKind: resolution.target.kind,
    targetCount: resolution.target.count,
  })
  return formatEffectRowSentenceFromParts(
    { kind: 'temporary-hit-points', roll: temporaryHitPoints.roll },
    { recipient },
  ).replace(/\.$/, '')
}

/** e.g. "2d10 Necrotic" — uses the first damage effect when several exist. */
export function formatResolutionDamage(resolution: SpellResolution): string {
  const damage = findResolutionDamageEffects(resolution)[0]
  if (!damage) return ''
  return formatDamageValue(damage.roll, damage.damageType)
}

/** Compact damage line using roll formatting only (no damage type label). */
export function formatResolutionDamageRoll(resolution: SpellResolution): string {
  const damage = findResolutionDamageEffects(resolution)[0]
  if (!damage) return ''
  return formatRollValue(damage.roll)
}
