import { z } from 'zod'

import { equipmentEffectTargetSchema } from '../../vocab/equipment/effect-target'

export const EQUIPMENT_EFFECT_BONUS_MIN = -10
export const EQUIPMENT_EFFECT_BONUS_MAX = 10

export const equipmentBonusEffectSchema = z
  .object({
    target: equipmentEffectTargetSchema,
    bonus: z
      .number()
      .int()
      .min(EQUIPMENT_EFFECT_BONUS_MIN)
      .max(EQUIPMENT_EFFECT_BONUS_MAX)
      .refine((value) => value !== 0, { message: 'Bonus must be non-zero.' }),
  })
  .strict()

export type EquipmentBonusEffect = z.infer<typeof equipmentBonusEffectSchema>

export const equipmentMechanicalEffectSchema = equipmentBonusEffectSchema
  .extend({
    effectId: z.string().min(1),
    notes: z.string().optional(),
  })
  .strict()

export type EquipmentMechanicalEffect = z.infer<typeof equipmentMechanicalEffectSchema>

/** Stepper helper — skips 0 when moving between signed values. */
export function nextNonZeroBonus(prev: number, next: number): number {
  if (next === 0) {
    return prev > 0 ? -1 : 1
  }
  return next
}
