import { z } from 'zod'

// ---------------------------------------------------------------------------
// Weapon taxonomy — minimal stub. Class proficiencies reference weapons by
// category; the full weapon content type (individual weapon ids/stats) is built
// later in the equipment feature and its schema added here.
// ---------------------------------------------------------------------------

export const WEAPON_CATEGORIES = ['simple', 'martial'] as const

export const weaponCategorySchema = z.enum(WEAPON_CATEGORIES)

export type WeaponCategory = z.infer<typeof weaponCategorySchema>
