import { z } from 'zod'

// ---------------------------------------------------------------------------
// Weapon categories — simple/martial taxonomy consumed by class proficiencies
// and the full weapon content type.
// ---------------------------------------------------------------------------

export const WEAPON_CATEGORIES = ['simple', 'martial'] as const

export const weaponCategorySchema = z.enum(WEAPON_CATEGORIES)

export type WeaponCategory = z.infer<typeof weaponCategorySchema>
