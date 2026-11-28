import { z } from 'zod'

import { overlaySlugList } from '../../content/lib/system-overlay/overlay-presets'
import { armorCategorySchema } from '../../vocab/armor/category'
import { weaponCategorySchema } from '../../vocab/weapon/category'
import { proficiencyGrantSetSchema } from './proficiency-grant-set'

// ---------------------------------------------------------------------------
// Typed proficiency grant sets — armor and weapon buckets shared by content
// authoring and campaign patches (primitives layer; no rpg/content import).
// ---------------------------------------------------------------------------

export const armorProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: overlaySlugList(armorCategorySchema).default([]),
})

export type ArmorProficiencyGrantSet = z.infer<typeof armorProficiencyGrantSetSchema>

export const weaponProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: overlaySlugList(weaponCategorySchema).default([]),
})

export type WeaponProficiencyGrantSet = z.infer<typeof weaponProficiencyGrantSetSchema>
