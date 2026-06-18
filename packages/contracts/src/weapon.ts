import { z } from 'zod'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './content'
import { averageDiceRoll, dieFaceSchema } from './dice'
import { moneySchema, weightSchema } from './units'
import type { GameTermEntry } from './vocab/types'

// ---------------------------------------------------------------------------
// Weapon taxonomy — category is the minimal stub consumed by class
// proficiencies. The full weapon content type lives below.
// ---------------------------------------------------------------------------

export const WEAPON_CATEGORIES = ['simple', 'martial'] as const

export const weaponCategorySchema = z.enum(WEAPON_CATEGORIES)

export type WeaponCategory = z.infer<typeof weaponCategorySchema>

// ---------------------------------------------------------------------------
// Mode
// ---------------------------------------------------------------------------

export const WEAPON_MODES = ['melee', 'ranged'] as const

export const weaponModeSchema = z.enum(WEAPON_MODES)

export type WeaponMode = z.infer<typeof weaponModeSchema>

// ---------------------------------------------------------------------------
// Damage types
// ---------------------------------------------------------------------------

export const WEAPON_DAMAGE_TYPES = ['bludgeoning', 'piercing', 'slashing'] as const

export const weaponDamageTypeSchema = z.enum(WEAPON_DAMAGE_TYPES)

export type WeaponDamageType = z.infer<typeof weaponDamageTypeSchema>

// ---------------------------------------------------------------------------
// Properties — the closed SRD 5.2.1 property set
// ---------------------------------------------------------------------------

export const WEAPON_PROPERTY_ENTRIES = {
  ammunition: {
    label: 'Ammunition',
    description:
      'You can use a weapon that has the Ammunition property to make a ranged attack only if you have ammunition to fire from it. The type of ammunition required is specified with the weapon’s range. Each attack expends one piece of ammunition. Drawing the ammunition is part of the attack (you need a free hand to load a one-handed weapon). After a fight, you can spend 1 minute to recover half the ammunition (round down) you used in the fight; the rest is lost.',
  },
  finesse: {
    label: 'Finesse',
    description:
      'When making an attack with a Finesse weapon, use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls.',
  },
  heavy: {
    label: 'Heavy',
    description:
      'You have Disadvantage on attack rolls with a Heavy weapon if it’s a Melee weapon and your Strength score isn’t at least 13 or if it’s a Ranged weapon and your Dexterity score isn’t at least 13.',
  },
  light: {
    label: 'Light',
    description:
      'When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don’t add your ability modifier to the extra attack’s damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don’t add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative.',
  },
  loading: {
    label: 'Loading',
    description:
      'You can fire only one piece of ammunition from a Loading weapon when you use an action, a Bonus Action, or a Reaction to fire it, regardless of the number of attacks you can normally make.',
  },
  reach: {
    label: 'Reach',
    description:
      'A Reach weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for Opportunity Attacks with it.',
  },
  special: {
    label: 'Special',
    description:
      'A weapon with this property has unusual rules described in the Special entry for the weapon.',
  },
  thrown: {
    label: 'Thrown',
    description:
      'If a weapon has the Thrown property, you can throw the weapon to make a ranged attack, and you can draw that weapon as part of the attack. If the weapon is a Melee weapon, use the same ability modifier for the attack and damage rolls that you use for a melee attack with that weapon.',
  },
  'two-handed': {
    label: 'Two-Handed',
    description: 'A Two-Handed weapon requires two hands when you attack with it.',
  },
  versatile: {
    label: 'Versatile',
    description:
      'A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack.',
  },
} as const satisfies Record<string, GameTermEntry>

export type WeaponProperty = keyof typeof WEAPON_PROPERTY_ENTRIES

export const WEAPON_PROPERTIES = Object.keys(WEAPON_PROPERTY_ENTRIES) as [
  WeaponProperty,
  ...WeaponProperty[],
]

export const weaponPropertySchema = z.enum(WEAPON_PROPERTIES)

/** Returns the reference entry for a property id, if known. */
export function getWeaponPropertyEntry(p: string): GameTermEntry | undefined {
  return WEAPON_PROPERTY_ENTRIES[p as WeaponProperty]
}

/** Returns the display label for a property id. Falls back to the raw value. */
export function getWeaponPropertyLabel(p: string): string {
  return getWeaponPropertyEntry(p)?.label ?? p
}

// ---------------------------------------------------------------------------
// Mastery — every SRD 5.2.1 weapon has exactly one mastery
// ---------------------------------------------------------------------------

export const WEAPON_MASTERY_ENTRIES = {
  cleave: {
    label: 'Cleave',
    description:
      'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.',
  },
  graze: {
    label: 'Graze',
    description:
      'If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.',
  },
  nick: {
    label: 'Nick',
    description:
      'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.',
  },
  push: {
    label: 'Push',
    description:
      'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.',
  },
  sap: {
    label: 'Sap',
    description:
      'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.',
  },
  slow: {
    label: 'Slow',
    description:
      'If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn’t exceed 10 feet.',
  },
  topple: {
    label: 'Topple',
    description:
      'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition.',
  },
  vex: {
    label: 'Vex',
    description:
      'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature.',
  },
} as const satisfies Record<string, GameTermEntry>

export type WeaponMastery = keyof typeof WEAPON_MASTERY_ENTRIES

export const WEAPON_MASTERIES = Object.keys(WEAPON_MASTERY_ENTRIES) as [
  WeaponMastery,
  ...WeaponMastery[],
]

export const weaponMasterySchema = z.enum(WEAPON_MASTERIES)

/** Returns the reference entry for a mastery id, if known. */
export function getWeaponMasteryEntry(m: string): GameTermEntry | undefined {
  return WEAPON_MASTERY_ENTRIES[m as WeaponMastery]
}

/** Returns the display label for a mastery id. Falls back to the raw value. */
export function getWeaponMasteryLabel(m: string): string {
  return getWeaponMasteryEntry(m)?.label ?? m
}

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
