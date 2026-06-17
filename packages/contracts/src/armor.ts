import { z } from 'zod'

// ---------------------------------------------------------------------------
// Armor taxonomy — minimal stub. Class proficiencies reference armor by
// category; the full armor content type (individual armor ids/stats) is built
// later in the equipment feature and its schema added here.
// ---------------------------------------------------------------------------

export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shields'] as const

export const armorCategorySchema = z.enum(ARMOR_CATEGORIES)

export type ArmorCategory = z.infer<typeof armorCategorySchema>
