import { z } from 'zod'

import { averageDiceRoll, dieFaceSchema } from '../primitives/dice'
import { moneySchema, weightSchema } from '../primitives/units'
import { PHYSICAL_DAMAGE_TYPE_IDS } from '../vocab/damage-type'
import {
  weaponCategorySchema,
  weaponMasterySchema,
  weaponModeSchema,
  weaponPropertySchema,
  getWeaponPropertyLabel,
  type WeaponProperty,
} from '../vocab/weapon'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'

// ---------------------------------------------------------------------------
// Damage types — weapons deal only physical damage. Derived from the shared
// `damage-type` vocab (single source of truth) so the two never drift.
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
// Damage — discriminated union covering both dice rolls and the blowgun's
// flat-1 case. `versatileDamage` is always dice-based (no flat versatile
// damage exists in SRD). The net has neither `damage` nor `damageType`.
// ---------------------------------------------------------------------------

export const diceDamageSchema = z.object({
  kind: z.literal('dice'),
  count: z.number().int().min(1),
  faces: dieFaceSchema,
})

export const flatDamageSchema = z.object({
  kind: z.literal('flat'),
  amount: z.number().int().min(1),
})

export const weaponDamageSchema = z.discriminatedUnion('kind', [diceDamageSchema, flatDamageSchema])

export type WeaponDamage = z.infer<typeof weaponDamageSchema>

/** Formats a weapon damage value for display (e.g. "1d6" or "1"). */
export function formatWeaponDamage(d: WeaponDamage): string {
  return d.kind === 'dice' ? `${d.count}d${d.faces}` : String(d.amount)
}

/**
 * Returns the average damage for a weapon damage value.
 * Delegates to `averageDiceRoll` for dice-based damage; returns the flat
 * amount directly for flat damage (e.g. the Blowgun's 1 piercing).
 *
 * @example averageWeaponDamage({ kind: 'dice', count: 1, faces: 8 }) // 4.5
 * @example averageWeaponDamage({ kind: 'flat', amount: 1 })          // 1
 */
export function averageWeaponDamage(d: WeaponDamage): number {
  return d.kind === 'dice' ? averageDiceRoll(d) : d.amount
}

// ---------------------------------------------------------------------------
// Body — the fields every weapon has. Unexported so `.shape` survives
// `.superRefine()` and can be spread into the stored/DTO schemas.
// ---------------------------------------------------------------------------

const weaponBodyFields = contentBodyBaseSchema.extend({
  category: weaponCategorySchema,
  mode: weaponModeSchema,
  cost: moneySchema,
  weight: weightSchema.optional(),
  /** Absent for utility weapons (net) that deal no damage. */
  damage: weaponDamageSchema.optional(),
  /** Must be present whenever `damage` is present, and absent otherwise. */
  damageType: weaponDamageTypeSchema.optional(),
  /** Dice rolled when wielded two-handed; present only when 'versatile' in properties. */
  versatileDamage: diceDamageSchema.optional(),
  properties: z.array(weaponPropertySchema),
  mastery: weaponMasterySchema,
  /** Normal/long throw or fire range in feet. Present for thrown/ranged weapons. */
  range: weaponRangeSchema.optional(),
  /** Prose for the 'special' property — lance mounted rule, net restrain text, etc. */
  specialRules: z.string().optional(),
})

/**
 * Cross-field invariants applied to both the body schema and the stored schema.
 * Extracted to avoid duplicating the predicate logic.
 */
function refineWeapon(val: z.infer<typeof weaponBodyFields>, ctx: z.RefinementCtx): void {
  const hasDamage = val.damage !== undefined
  const hasDamageType = val.damageType !== undefined
  if (hasDamage !== hasDamageType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasDamage ? ['damageType'] : ['damage'],
      message: '`damage` and `damageType` must both be present or both be absent',
    })
  }

  const hasVersatile = val.properties.includes('versatile')
  const hasVersatileDamage = val.versatileDamage !== undefined
  if (hasVersatile && !hasVersatileDamage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['versatileDamage'],
      message: '`versatileDamage` is required when the `versatile` property is set',
    })
  }
  if (!hasVersatile && hasVersatileDamage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['versatileDamage'],
      message: '`versatileDamage` must be absent when the `versatile` property is not set',
    })
  }
}

// ---------------------------------------------------------------------------
// Exported schemas + types
// ---------------------------------------------------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const weaponBodySchema = weaponBodyFields.superRefine(refineWeapon)
export type WeaponBody = z.infer<typeof weaponBodySchema>

/** Stored shape = ownership envelope + body fields + refinements. */
export const weaponSchema = contentMetaSchema
  .extend(weaponBodyFields.shape)
  .superRefine(refineWeapon)
export type Weapon = z.infer<typeof weaponSchema>

// Homebrew authoring DTOs. Server sets id/source/campaignId/timestamps.
export const createWeaponInputSchema = weaponBodyFields
  .extend({ slug: slugSchema })
  .superRefine(refineWeapon)
export type CreateWeaponInput = z.infer<typeof createWeaponInputSchema>

// Partial update — cross-field invariants are not checked here because the
// caller may legitimately send a subset of fields. Invariants are re-enforced
// at merge time when the full record is parsed before writing.
export const updateWeaponInputSchema = weaponBodyFields.extend({ slug: slugSchema }).partial()
export type UpdateWeaponInput = z.infer<typeof updateWeaponInputSchema>

export const weaponPatchSchema = contentPatchBaseSchema.extend({
  patch: weaponBodyFields.partial(),
})
export type WeaponPatch = z.infer<typeof weaponPatchSchema>
