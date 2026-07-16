import { formatRollValue } from '../../../primitives/mechanics/roll'
import { formatDamageValue } from '../effects/display'
import { formatEffectRowSentenceFromParts, type EffectRowParts } from '../effects/format'
import { resolutionEffectFormatOptions } from './effect-context'
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

function formatResolutionEffectLine(resolution: SpellResolution, parts: EffectRowParts): string {
  return formatEffectRowSentenceFromParts(parts, resolutionEffectFormatOptions(resolution)).replace(
    /\.$/,
    '',
  )
}

/** Recipient-aware preview sentence for the primary healing effect. */
export function formatResolutionHealing(resolution: SpellResolution): string {
  const healing = findResolutionHealingEffects(resolution)[0]
  if (!healing) return ''
  return formatResolutionEffectLine(resolution, { kind: 'healing', roll: healing.roll })
}

/** Recipient-aware preview sentence for the primary temporary hit points effect. */
export function formatResolutionTemporaryHitPoints(resolution: SpellResolution): string {
  const temporaryHitPoints = findResolutionTemporaryHitPointsEffects(resolution)[0]
  if (!temporaryHitPoints) return ''
  return formatResolutionEffectLine(resolution, {
    kind: 'temporary-hit-points',
    roll: temporaryHitPoints.roll,
  })
}

/** Recipient-aware preview sentence for the primary damage effect. */
export function formatResolutionDamage(resolution: SpellResolution): string {
  const damage = findResolutionDamageEffects(resolution)[0]
  if (!damage) return ''
  return formatResolutionEffectLine(resolution, {
    kind: 'damage',
    roll: damage.roll,
    damageType: damage.damageType,
  })
}

/** Compact mechanical damage fragment (e.g. "8d6 Fire damage") — not a preview sentence. */
export function formatResolutionDamageValue(resolution: SpellResolution): string {
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

/** Preview sentence for one outcome application. */
export function formatResolutionApplicationSentence(
  resolution: SpellResolution,
  effectId: string,
  amount: 'full' | 'half',
): string {
  const effect = resolution.effects.find((entry) => entry.id === effectId)
  if (!effect) return ''

  if (effect.kind === 'damage') {
    return formatEffectRowSentenceFromParts(
      { kind: 'damage', roll: effect.roll, damageType: effect.damageType },
      resolutionEffectFormatOptions(resolution, { applicationAmount: amount }),
    ).replace(/\.$/, '')
  }

  if (effect.kind === 'healing') {
    return formatEffectRowSentenceFromParts(
      { kind: 'healing', roll: effect.roll },
      resolutionEffectFormatOptions(resolution, { applicationAmount: amount }),
    ).replace(/\.$/, '')
  }

  if (effect.kind === 'temporary-hit-points') {
    return formatEffectRowSentenceFromParts(
      { kind: 'temporary-hit-points', roll: effect.roll },
      resolutionEffectFormatOptions(resolution, { applicationAmount: amount }),
    ).replace(/\.$/, '')
  }

  return ''
}
