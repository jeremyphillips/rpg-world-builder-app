import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'

import { armorCategorySchema } from '../../vocab/armor/category'
import { resolveArmorDexterityRule } from '../../vocab/armor/dexterity-rule'
import { armorMaterialSchema } from '../../vocab/armor/material'
import {
  BASE_AC_OFFSET_RANGE,
  armorClassFromProtection,
  type ArmorClassRules,
} from '../../vocab/mechanics/armor-class-scale'
import { abilityScoreRequirementsSchema } from '../lib/ability-score-requirements'
import type { EquipmentBaseFields } from './base'
import { equipmentVariantValidationMessages } from './equipment-variant-messages'

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
   * Protection above the ruleset unarmored base. Required for body armor; absent
   * for shields (shields contribute an `acBonus` instead). Context-free: 0..15.
   */
  baseAcOffset: z
    .number()
    .int()
    .min(BASE_AC_OFFSET_RANGE.min)
    .max(BASE_AC_OFFSET_RANGE.max)
    .optional(),
  /**
   * Flat AC bonus added on top of the wearer's AC. Required for shields;
   * absent for body armor.
   */
  acBonus: z.number().int().optional(),
  stealthDisadvantage: z.boolean(),
  /**
   * Minimum ability scores to wear without penalty (AND of minimums). Read through
   * `getEquipmentAbilityScoreRequirements`, never by indexing an ability directly.
   */
  abilityScoreRequirements: abilityScoreRequirementsSchema.optional(),
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
      addCustomRefinementIssue(ctx, equipmentVariantValidationMessages.shieldAcBonusRequired(), [
        'acBonus',
      ])
    }
  } else if (val.baseAcOffset === undefined) {
    addCustomRefinementIssue(ctx, equipmentVariantValidationMessages.bodyArmorBaseAcRequired(), [
      'baseAcOffset',
    ])
  }
}

type ArmorAcDisplayFields = Pick<ArmorEquipmentKindFields, 'category' | 'baseAcOffset' | 'acBonus'>

/**
 * Returns a human-readable AC string for the detail page and table columns.
 *
 * @example getArmorAcDisplay(leather, ascending10)    // "11 + Dex"
 * @example getArmorAcDisplay(chainMail, ascending10)  // "16 (no Dex)"
 * @example getArmorAcDisplay(halfPlate, ascending10)  // "15 + Dex (max 2)"
 * @example getArmorAcDisplay(shieldWood, ascending10) // "+2"
 */
export function getArmorAcDisplay(armor: ArmorAcDisplayFields, rules: ArmorClassRules): string {
  if (armor.category === 'shields') return `+${armor.acBonus ?? 0}`
  const base = armorClassFromProtection(rules, armor.baseAcOffset ?? 0)
  const rule = resolveArmorDexterityRule(armor.category)
  if (rule.mode === 'none') return `${base} (no Dex)`
  if (rule.mode === 'capped') return `${base} + Dex (max ${rule.maxBonus})`
  return `${base} + Dex`
}
