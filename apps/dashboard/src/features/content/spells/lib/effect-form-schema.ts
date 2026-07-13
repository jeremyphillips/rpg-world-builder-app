import { z } from 'zod'

import {
  damageTypeIdSchema,
  getSpellAtomicEffectKindLabel,
  SPELL_ATOMIC_EFFECT_KINDS,
  type SpellAtomicEffectKind,
} from '@rpg/contracts'
import { rollFormObjectSchema } from '../../lib/forms/mechanics/roll-form-values'

export const SPELL_ATOMIC_EFFECT_KIND_LABELS = Object.fromEntries(
  SPELL_ATOMIC_EFFECT_KINDS.map((kind) => [kind, getSpellAtomicEffectKindLabel(kind)]),
) as Record<SpellAtomicEffectKind, string>

export type EffectFieldPresence = 'required' | 'optional' | 'none'

export type EffectFieldMatrixRow = {
  roll: EffectFieldPresence
  damageType: EffectFieldPresence
  count: EffectFieldPresence
  label: EffectFieldPresence
  unitLabel: EffectFieldPresence
  description: EffectFieldPresence
}

/**
 * Per-kind field matrix for the atomic effects array editor.
 *
 * The row schema stays permissive while editing; normalization enforces the
 * `required` cells via `spellAtomicEffectSchema` and `normalizeSpellEffects`.
 *
 * | Kind                  | roll     | damageType | count    | label    | unitLabel | description |
 * | --------------------- | -------- | ---------- | -------- | -------- | --------- | ----------- |
 * | damage                | required | required   | none     | optional | none      | optional    |
 * | healing               | required | none       | none     | optional | none      | optional    |
 * | temporary-hit-points  | required | none       | none     | optional | none      | optional    |
 * | projectile-count      | none     | none       | required | none     | required  | optional    |
 */
export const SPELL_ATOMIC_EFFECT_FIELD_MATRIX: Record<SpellAtomicEffectKind, EffectFieldMatrixRow> =
  {
    damage: {
      roll: 'required',
      damageType: 'required',
      count: 'none',
      label: 'optional',
      unitLabel: 'none',
      description: 'optional',
    },
    healing: {
      roll: 'required',
      damageType: 'none',
      count: 'none',
      label: 'optional',
      unitLabel: 'none',
      description: 'optional',
    },
    'temporary-hit-points': {
      roll: 'required',
      damageType: 'none',
      count: 'none',
      label: 'optional',
      unitLabel: 'none',
      description: 'optional',
    },
    'projectile-count': {
      roll: 'none',
      damageType: 'none',
      count: 'required',
      label: 'none',
      unitLabel: 'required',
      description: 'optional',
    },
  }

const effectFormRollSchema = rollFormObjectSchema.optional()

/** Permissive row schema for in-progress effect array editing. */
export function createEffectFormRowSchema() {
  return z.object({
    id: z.string().min(1),
    kind: z.enum(SPELL_ATOMIC_EFFECT_KINDS),
    label: z.string().optional(),
    unitLabel: z.string().optional(),
    description: z.string().optional(),
    roll: effectFormRollSchema,
    damageType: damageTypeIdSchema.optional(),
    count: z.coerce.number().int().min(1).optional(),
  })
}

export const effectFormRowSchema = createEffectFormRowSchema()

export type EffectFormRow = z.infer<typeof effectFormRowSchema>

export const spellEffectsFormSchema = z.array(effectFormRowSchema).optional()

export type SpellEffectsFormValues = z.infer<typeof spellEffectsFormSchema>
