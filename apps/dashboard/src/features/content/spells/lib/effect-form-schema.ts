import { z } from 'zod'

import { rollFormObjectSchema } from '../../lib/forms/mechanics/roll-form-values'
import {
  damageTypeIdSchema,
  SPELL_ATOMIC_EFFECT_KINDS,
  type SpellAtomicEffectKind,
} from '@rpg/contracts'

export const SPELL_ATOMIC_EFFECT_KIND_LABELS: Record<SpellAtomicEffectKind, string> = {
  damage: 'Damage',
  healing: 'Healing',
  'temporary-hit-points': 'Temporary hit points',
  'projectile-count': 'Projectile count',
}

const effectFormRollSchema = rollFormObjectSchema.optional()

/** Permissive row schema for in-progress effect array editing. */
export function createEffectFormRowSchema() {
  return z.object({
    id: z.string().min(1),
    kind: z.enum(SPELL_ATOMIC_EFFECT_KINDS),
    label: z.string().optional(),
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
