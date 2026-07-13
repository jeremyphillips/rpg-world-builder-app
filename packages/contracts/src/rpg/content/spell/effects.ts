import { z } from 'zod'

import {
  effectBaseFields,
  effectLabelSchema,
  effectUnitLabelSchema,
} from '../../primitives/mechanics/effect-base'
import { formatRollValue, rollSchema, type RollValue } from '../../primitives/mechanics/roll'
import { damageTypeIdSchema, getDamageTypeLabel } from '../../vocab/damage/vocabulary'
import {
  getSpellAtomicEffectKindLabel,
  HIT_POINTS_TERM,
  SPELL_ATOMIC_EFFECT_KINDS,
  type SpellAtomicEffectKind,
} from '../../vocab/spell/atomic-effect-kind'

export { SPELL_ATOMIC_EFFECT_KINDS, type SpellAtomicEffectKind }

// ---------------------------------------------------------------------------
// Spell atomic effects — spell-owned union; not a global mechanics union.
// ---------------------------------------------------------------------------

const spellEffectBaseSchema = z.object(effectBaseFields)

export const spellDamageEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('damage'),
  label: effectLabelSchema,
  roll: rollSchema,
  damageType: damageTypeIdSchema,
})

export const spellHealingEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('healing'),
  label: effectLabelSchema,
  roll: rollSchema,
})

export const spellTemporaryHitPointsEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('temporary-hit-points'),
  label: effectLabelSchema,
  roll: rollSchema,
})

export const spellProjectileCountEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('projectile-count'),
  count: z.number().int().min(1),
  unitLabel: effectUnitLabelSchema,
})

export const spellAtomicEffectSchema = z.discriminatedUnion('kind', [
  spellDamageEffectSchema,
  spellHealingEffectSchema,
  spellTemporaryHitPointsEffectSchema,
  spellProjectileCountEffectSchema,
])

export type SpellAtomicEffect = z.infer<typeof spellAtomicEffectSchema>
export type SpellDamageEffect = z.infer<typeof spellDamageEffectSchema>
export type SpellHealingEffect = z.infer<typeof spellHealingEffectSchema>
export type SpellTemporaryHitPointsEffect = z.infer<typeof spellTemporaryHitPointsEffectSchema>
export type SpellProjectileCountEffect = z.infer<typeof spellProjectileCountEffectSchema>

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
 * Full sentence for an effect array item summary (grant-style authoring headers).
 * Returns empty string when required fields for the kind are absent.
 */
export function formatEffectRowSentence(effect: SpellAtomicEffect): string {
  switch (effect.kind) {
    case 'damage':
      return `Inflicts ${formatDamageValue(effect.roll, effect.damageType)}.`
    case 'healing':
      return `Character heals ${formatRollValue(effect.roll)} ${HIT_POINTS_TERM.plural}.`
    case 'temporary-hit-points':
      return `Character gains ${formatRollValue(effect.roll)} temporary ${HIT_POINTS_TERM.plural}.`
    case 'projectile-count':
      return `Creates ${effect.count} ${effect.unitLabel}.`
    default: {
      const _exhaustive: never = effect
      return _exhaustive
    }
  }
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

export const EFFECTS_MODELING_STATUS = ['prose-only', 'partially-modeled', 'modeled'] as const

export type EffectsModelingStatus = (typeof EFFECTS_MODELING_STATUS)[number]

/** Derives effects-layer modeling status from present structure (not persisted). */
export function deriveEffectsModelingStatus(spell: {
  effects?: readonly SpellAtomicEffect[] | null
}): EffectsModelingStatus {
  if (!spell.effects?.length) return 'prose-only'
  return 'partially-modeled'
}
