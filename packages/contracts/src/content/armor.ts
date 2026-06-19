import { z } from 'zod'

import { armorCategorySchema } from '../vocab/armor/category'
import { armorMaterialSchema } from '../vocab/armor/material'
import { moneySchema, weightSchema } from '../primitives/units'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'

export {
  ARMOR_MATERIALS,
  armorMaterialSchema,
  getArmorMaterialEntry,
  getArmorMaterialLabel,
  type ArmorMaterial,
} from '../vocab/armor/material'

// ---------------------------------------------------------------------------
// Body — the fields every armor record has. Unexported so `.shape` survives
// `.superRefine()` and can be spread into the stored/DTO schemas.
// ---------------------------------------------------------------------------

const armorBodyFields = contentBodyBaseSchema.extend({
  category: armorCategorySchema,
  cost: moneySchema,
  weight: weightSchema.optional(),
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
})

/**
 * Cross-field invariants: shields require `acBonus`; all body armor requires
 * `baseAc`. Extracted so the predicate can be applied to both the body schema
 * and the stored schema without duplication.
 */
function refineArmor(val: z.infer<typeof armorBodyFields>, ctx: z.RefinementCtx): void {
  if (val.category === 'shields') {
    if (val.acBonus === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['acBonus'],
        message: '`acBonus` is required for shields',
      })
    }
  } else {
    if (val.baseAc === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseAc'],
        message: '`baseAc` is required for body armor',
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Exported schemas + types
// ---------------------------------------------------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const armorBodySchema = armorBodyFields.superRefine(refineArmor)
export type ArmorBody = z.infer<typeof armorBodySchema>

/** Stored shape = ownership envelope + body fields + refinements. */
export const armorSchema = contentMetaSchema.extend(armorBodyFields.shape).superRefine(refineArmor)
export type Armor = z.infer<typeof armorSchema>

// Homebrew authoring DTOs. Server sets id/source/campaignId/timestamps.
export const createArmorInputSchema = armorBodyFields
  .extend({ slug: slugSchema })
  .superRefine(refineArmor)
export type CreateArmorInput = z.infer<typeof createArmorInputSchema>

// Partial update — cross-field invariants are not checked here because the
// caller may legitimately send a subset of fields. Invariants are re-enforced
// at merge time when the full record is parsed before writing.
export const updateArmorInputSchema = armorBodyFields.extend({ slug: slugSchema }).partial()
export type UpdateArmorInput = z.infer<typeof updateArmorInputSchema>

export const armorPatchSchema = contentPatchBaseSchema.extend({
  patch: armorBodyFields.partial(),
})
export type ArmorPatch = z.infer<typeof armorPatchSchema>

// ---------------------------------------------------------------------------
// Display helper
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable AC string for the detail page and table columns.
 *
 * @example getArmorAcDisplay(leather)       // "11 + Dex"
 * @example getArmorAcDisplay(chainMail)     // "16"
 * @example getArmorAcDisplay(halfPlate)     // "15 + Dex (max 2)"
 * @example getArmorAcDisplay(shieldWood)    // "+2"
 */
export function getArmorAcDisplay(
  a: Pick<ArmorBody, 'category' | 'baseAc' | 'acBonus' | 'addDexModifier' | 'maxDexBonus'>,
): string {
  if (a.category === 'shields') return `+${a.acBonus ?? 0}`
  const base = a.baseAc ?? 0
  if (!a.addDexModifier) return String(base)
  return a.maxDexBonus !== undefined ? `${base} + Dex (max ${a.maxDexBonus})` : `${base} + Dex`
}
