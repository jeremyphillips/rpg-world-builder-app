import { z } from 'zod'

import { diceSchema } from '../../primitives/dice'
import {
  averageRollValue,
  formatRollValue,
  rollSchema,
  type RollValue,
} from '../../primitives/mechanics/roll'
import { PHYSICAL_DAMAGE_TYPE_IDS } from '../../vocab/damage/physical'
import {
  getWeaponPropertyLabel,
  weaponCategorySchema,
  weaponMasterySchema,
  weaponModeSchema,
  weaponPropertySchema,
  type WeaponProperty,
} from '../../vocab/weapon'
import type { EquipmentBaseFields } from './base'
import { equipmentVariantValidationMessages } from './equipment-variant-messages'

// ---------------------------------------------------------------------------
// Damage types — weapons deal only physical damage.
// ---------------------------------------------------------------------------

export const weaponDamageTypeSchema = z.enum(PHYSICAL_DAMAGE_TYPE_IDS)

export type WeaponDamageType = z.infer<typeof weaponDamageTypeSchema>

// ---------------------------------------------------------------------------
// Range — normal reach in feet; long is optional (absent for melee-only)
// ---------------------------------------------------------------------------

export const weaponRangeSchema = z.object({
  normal: z.number().int().min(0),
  long: z.number().int().min(0).optional(),
})

export type WeaponRange = z.infer<typeof weaponRangeSchema>

const EMPTY_STAT_DISPLAY = '—'

/** Formats weapon properties for display (e.g. "Versatile, Finesse" or "—"). */
export function formatWeaponProperties(properties: readonly WeaponProperty[]): string {
  return properties.length > 0
    ? properties.map((p) => getWeaponPropertyLabel(p)).join(', ')
    : EMPTY_STAT_DISPLAY
}

/** Formats a weapon range for display (e.g. "80/320 ft." or "5 ft."). */
export function formatWeaponRange(range: WeaponRange): string {
  return range.long !== undefined ? `${range.normal}/${range.long} ft.` : `${range.normal} ft.`
}

// ---------------------------------------------------------------------------
// Damage — shared RollValue primitive (dice, flat, or both).
// ---------------------------------------------------------------------------

/** Weapon damage uses the shared roll primitive. */
export const weaponDamageSchema = rollSchema

export type WeaponDamage = RollValue

/** Formats weapon damage for display (e.g. "1d6", "1", "1d8+2"). */
export function formatWeaponDamage(d: WeaponDamage): string {
  return formatRollValue(d)
}

/**
 * Returns the average damage for a weapon damage value.
 *
 * @example averageWeaponDamage({ dice: { count: 1, faces: 8 } }) // 4.5
 * @example averageWeaponDamage({ flat: 1 })                    // 1
 */
export function averageWeaponDamage(d: WeaponDamage): number {
  return averageRollValue(d)
}

// ---------------------------------------------------------------------------
// Weapon equipment variant
// ---------------------------------------------------------------------------

/** Kind-specific fields for `kind: 'weapon'`. Spread onto {@link EquipmentBaseFields}. */
export const weaponEquipmentKindFields = {
  kind: z.literal('weapon'),
  category: weaponCategorySchema,
  mode: weaponModeSchema,
  /** Absent for utility weapons (net) that deal no damage. */
  damage: weaponDamageSchema.optional(),
  /** Must be present whenever `damage` is present, and absent otherwise. */
  damageType: weaponDamageTypeSchema.optional(),
  /** Dice rolled when wielded two-handed; present only when 'versatile' in properties. */
  versatileDamage: diceSchema.optional(),
  properties: z.array(weaponPropertySchema),
  mastery: weaponMasterySchema,
  /** Normal/long throw or fire range in feet. Present for thrown/ranged weapons. */
  range: weaponRangeSchema.optional(),
  /** Prose for the 'special' property — lance mounted rule, net restrain text, etc. */
  specialRules: z.string().optional(),
} as const

export const weaponEquipmentKindSchema = z.object(weaponEquipmentKindFields)

export type WeaponEquipmentKindFields = z.infer<typeof weaponEquipmentKindSchema>

/** Cross-field invariants for weapon equipment records. */
export function refineWeaponEquipment(
  val: EquipmentBaseFields & WeaponEquipmentKindFields,
  ctx: z.RefinementCtx,
): void {
  const hasDamage = val.damage !== undefined
  const hasDamageType = val.damageType !== undefined
  if (hasDamage !== hasDamageType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasDamage ? ['damageType'] : ['damage'],
      message: equipmentVariantValidationMessages.damageDamageTypeTogether(),
    })
  }

  const hasVersatile = val.properties.includes('versatile')
  const hasVersatileDamage = val.versatileDamage !== undefined
  if (hasVersatile && !hasVersatileDamage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['versatileDamage'],
      message: equipmentVariantValidationMessages.versatileDamageRequired(),
    })
  }
  if (!hasVersatile && hasVersatileDamage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['versatileDamage'],
      message: equipmentVariantValidationMessages.versatileDamageForbidden(),
    })
  }
}
