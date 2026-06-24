import { z } from 'zod'

import { armorCategorySchema } from '../../vocab/armor/category'
import { armorMaterialSchema } from '../../vocab/armor/material'
import type { EquipmentBaseFields } from './base'

export {
  ARMOR_MATERIALS,
  armorMaterialSchema,
  getArmorMaterialEntry,
  getArmorMaterialLabel,
  type ArmorMaterial,
} from '../../vocab/armor/material'

// ---------------------------------------------------------------------------
// Armor equipment variant
// ---------------------------------------------------------------------------

/** Kind-specific fields for `kind: 'armor'`. Spread onto {@link EquipmentBaseFields}. */
export const armorEquipmentKindFields = {
  kind: z.literal('armor'),
  category: armorCategorySchema,
  material: armorMaterialSchema.optional(),
  /**
   * Base AC before Dex modifier. Required for body armor; absent for shields
   * (shields contribute an `acBonus` instead).
   */
  baseAc: z.number().int().optional(),
  /**
   * Flat AC bonus added on top of the wearer's AC. Required for shields;
   * absent for body armor.
   */
  acBonus: z.number().int().optional(),
  /** Light/medium armor adds Dex modifier; heavy armor and shields do not. */
  addDexModifier: z.boolean(),
  /** Medium armor caps the Dex bonus at +2; absent for light and shields. */
  maxDexBonus: z.number().int().optional(),
  stealthDisadvantage: z.boolean(),
  /** Minimum Strength score required to wear without speed penalty (heavy armor). */
  strengthRequirement: z.number().int().optional(),
} as const

export const armorEquipmentKindSchema = z.object(armorEquipmentKindFields)

export type ArmorEquipmentKindFields = z.infer<typeof armorEquipmentKindSchema>

/** Cross-field invariants for armor equipment records. */
export function refineArmorEquipment(
  val: EquipmentBaseFields & ArmorEquipmentKindFields,
  ctx: z.RefinementCtx,
): void {
  if (val.category === 'shields') {
    if (val.acBonus === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['acBonus'],
        message: '`acBonus` is required for shields',
      })
    }
  } else if (val.baseAc === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['baseAc'],
      message: '`baseAc` is required for body armor',
    })
  }
}

type ArmorAcDisplayFields = Pick<
  ArmorEquipmentKindFields,
  'category' | 'baseAc' | 'acBonus' | 'addDexModifier' | 'maxDexBonus'
>

/**
 * Returns a human-readable AC string for the detail page and table columns.
 *
 * @example getArmorAcDisplay(leather)       // "11 + Dex"
 * @example getArmorAcDisplay(chainMail)     // "16"
 * @example getArmorAcDisplay(halfPlate)     // "15 + Dex (max 2)"
 * @example getArmorAcDisplay(shieldWood)    // "+2"
 */
export function getArmorAcDisplay(a: ArmorAcDisplayFields): string {
  if (a.category === 'shields') return `+${a.acBonus ?? 0}`
  const base = a.baseAc ?? 0
  if (!a.addDexModifier) return String(base)
  return a.maxDexBonus !== undefined ? `${base} + Dex (max ${a.maxDexBonus})` : `${base} + Dex`
}
