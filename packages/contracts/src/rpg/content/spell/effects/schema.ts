import { z } from 'zod'

import {
  effectBaseFields,
  effectLabelSchema,
  effectUnitLabelSchema,
} from '../../../primitives/mechanics/effect-base'
import { rollSchema } from '../../../primitives/mechanics/roll'
import { damageTypeIdSchema } from '../../../vocab/damage/vocabulary'
import {
  SPELL_ATOMIC_EFFECT_KINDS,
  type SpellAtomicEffectKind,
} from '../../../vocab/spell/atomic-effect-kind'

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
