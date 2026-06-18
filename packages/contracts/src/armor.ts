import { z } from 'zod'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './content'
import { moneySchema, weightSchema } from './units'
import type { GameTermEntry } from './vocab/types'

// ---------------------------------------------------------------------------
// Armor taxonomy — the closed SRD 5.2.1 category set. Used by both class
// proficiencies (the original stub consumer) and the full armor content type.
// ---------------------------------------------------------------------------

export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shields'] as const

export const armorCategorySchema = z.enum(ARMOR_CATEGORIES)

export type ArmorCategory = z.infer<typeof armorCategorySchema>

export const ARMOR_CATEGORY_ENTRIES = {
  light: {
    label: 'Light Armor',
    description: '1 minute to don or doff.',
  },
  medium: {
    label: 'Medium Armor',
    description: '5 minutes to don and 1 minute to doff.',
  },
  heavy: {
    label: 'Heavy Armor',
    description: '10 minutes to don and 5 minutes to doff.',
  },
  shields: {
    label: 'Shield',
    description: 'Utilize action to don or doff.',
  },
} as const satisfies Record<ArmorCategory, GameTermEntry>

/** Returns the reference entry for an armor category, if known. */
export function getArmorCategoryEntry(c: string): GameTermEntry | undefined {
  return ARMOR_CATEGORY_ENTRIES[c as ArmorCategory]
}

/** Returns the display label for an armor category. Falls back to the raw value. */
export function getArmorCategoryLabel(c: string): string {
  return getArmorCategoryEntry(c)?.label ?? c
}

// ---------------------------------------------------------------------------
// Material — drives the druid non-metal rule and flavor display
// ---------------------------------------------------------------------------

export const ARMOR_MATERIALS = ['organic', 'metal'] as const

export const armorMaterialSchema = z.enum(ARMOR_MATERIALS)

export type ArmorMaterial = z.infer<typeof armorMaterialSchema>

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
