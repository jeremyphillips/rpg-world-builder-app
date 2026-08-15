import { z } from 'zod'

import { armorCategorySchema } from '../../vocab/armor/category'
import { weaponCategorySchema } from '../../vocab/weapon/category'
import { proficiencyGrantSetSchema } from './proficiency-grant-set'

// ---------------------------------------------------------------------------
// Typed proficiency grant sets — armor and weapon buckets shared by content
// authoring and campaign patches (primitives layer; no rpg/content import).
// ---------------------------------------------------------------------------

export const armorProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: z.array(armorCategorySchema).default([]),
})

export type ArmorProficiencyGrantSet = z.infer<typeof armorProficiencyGrantSetSchema>

export const weaponProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: z.array(weaponCategorySchema).default([]),
})

export type WeaponProficiencyGrantSet = z.infer<typeof weaponProficiencyGrantSetSchema>
