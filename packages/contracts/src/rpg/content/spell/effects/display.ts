import { formatRollValue, type RollValue } from '../../../primitives/mechanics/roll'
import { getDamageTypeLabel } from '../../../vocab/damage/vocabulary'
import { HIT_POINTS_TERM } from '../../../primitives/mechanics/hit-points-term'
import {
  getSpellAtomicEffectKindLabel,
  type SpellAtomicEffectKind,
} from '../../../vocab/spell/atomic-effect-kind'

import type { SpellAtomicEffect, SpellProjectileCountEffect } from './schema'

/** `{Kind label} — {detail}` title prefix (grant-style array item headers). */
export function effectKindPrefix(kindLabel: string, detail?: string): string {
  const trimmed = detail?.trim()
  return trimmed ? `${kindLabel} — ${trimmed}` : kindLabel
}

/** Primary title for an atomic effect array item. */
export function formatEffectRowTitle(effect: SpellAtomicEffect): string {
  const kindLabel = getSpellAtomicEffectKindLabel(effect.kind)
  if (effect.kind === 'projectile-count') {
    return effectKindPrefix(kindLabel, effect.unitLabel)
  }
  return effectKindPrefix(kindLabel, effect.label)
}

/** Title from in-progress form parts before normalization completes. */
export function formatEffectRowTitleFromParts(
  kind: SpellAtomicEffectKind | undefined,
  options: { label?: unknown; unitLabel?: unknown },
  fallbackIndex?: number,
): string {
  if (!kind) {
    return fallbackIndex != null ? `Effect ${fallbackIndex + 1}` : 'Effect'
  }

  const kindLabel = getSpellAtomicEffectKindLabel(kind)
  if (kind === 'projectile-count') {
    const unitLabel = typeof options.unitLabel === 'string' ? options.unitLabel.trim() : ''
    return effectKindPrefix(kindLabel, unitLabel || undefined)
  }

  const label = typeof options.label === 'string' ? options.label.trim() : ''
  return effectKindPrefix(kindLabel, label || undefined)
}

/** Formats a damage roll with type label (e.g. "8d6 Fire damage"). */
export function formatDamageValue(roll: RollValue, damageTypeId: string): string {
  return `${formatRollValue(roll)} ${getDamageTypeLabel(damageTypeId)} damage`
}

function formatProjectileCountCompact(effect: SpellProjectileCountEffect): string {
  return `${effect.count} ${effect.unitLabel}`
}

/**
 * Compact single-line summary for spell detail sections and previews.
 * Does not infer relationships between effects (e.g. per-projectile damage).
 */
export function formatAtomicEffectSummary(effect: SpellAtomicEffect): string {
  if (effect.kind === 'projectile-count') {
    return formatProjectileCountCompact(effect)
  }

  switch (effect.kind) {
    case 'damage':
      return formatDamageValue(effect.roll, effect.damageType)
    case 'healing':
      return `${formatRollValue(effect.roll)} healing`
    case 'temporary-hit-points':
      return `${formatRollValue(effect.roll)} temporary ${HIT_POINTS_TERM.plural}`
    default: {
      const _exhaustive: never = effect
      return _exhaustive
    }
  }
}

/**
 * Formats multiple spell effects as separate compact lines without implying
 * cross-effect semantics (e.g. Magic Missile dart count vs dart damage).
 */
export function formatAtomicEffectSummaries(effects: readonly SpellAtomicEffect[]): string[] {
  return effects.map((effect) => formatAtomicEffectSummary(effect))
}
