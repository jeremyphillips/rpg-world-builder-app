import { z } from 'zod'

import { effectBaseFields } from '../../primitives/mechanics/effect-base'
import { formatRollValue, rollSchema, type RollValue } from '../../primitives/mechanics/roll'
import { damageTypeIdSchema, getDamageTypeLabel } from '../../vocab/damage/vocabulary'

// ---------------------------------------------------------------------------
// Spell atomic effects — spell-owned union; not a global mechanics union.
// ---------------------------------------------------------------------------

export const SPELL_ATOMIC_EFFECT_KINDS = [
  'damage',
  'healing',
  'temporary-hit-points',
  'projectile-count',
] as const

export type SpellAtomicEffectKind = (typeof SPELL_ATOMIC_EFFECT_KINDS)[number]

const spellEffectBaseSchema = z.object(effectBaseFields)

export const spellDamageEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('damage'),
  roll: rollSchema,
  damageType: damageTypeIdSchema,
})

export const spellHealingEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('healing'),
  roll: rollSchema,
})

export const spellTemporaryHitPointsEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('temporary-hit-points'),
  roll: rollSchema,
})

export const spellProjectileCountEffectSchema = spellEffectBaseSchema.extend({
  kind: z.literal('projectile-count'),
  count: z.number().int().min(1),
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

/** Formats a damage roll with type label (e.g. "8d6 Fire damage"). */
export function formatDamageValue(roll: RollValue, damageTypeId: string): string {
  return `${formatRollValue(roll)} ${getDamageTypeLabel(damageTypeId)} damage`
}

function formatProjectileCountSummary(effect: SpellProjectileCountEffect): string {
  if (effect.label) {
    return `${effect.count} ${effect.label}`
  }
  return `${effect.count} projectiles`
}

/**
 * Formats a single spell effect for card summaries and previews.
 * Does not infer relationships between effects (e.g. per-projectile damage).
 */
export function formatAtomicEffectSummary(effect: SpellAtomicEffect): string {
  if (effect.kind === 'projectile-count') {
    return formatProjectileCountSummary(effect)
  }

  const heading = effect.label?.trim()
  const body = (() => {
    switch (effect.kind) {
      case 'damage':
        return formatDamageValue(effect.roll, effect.damageType)
      case 'healing':
        return `${formatRollValue(effect.roll)} healing`
      case 'temporary-hit-points':
        return `${formatRollValue(effect.roll)} temporary Hit Points`
      default: {
        const _exhaustive: never = effect
        return _exhaustive
      }
    }
  })()

  return heading ? `${heading}: ${body}` : body
}

/**
 * Formats multiple spell effects as separate lines without implying
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
