import type { WeaponCategory } from '@rpg/contracts'

import {
  weaponProficiencyGrantSetFromMode,
  type WeaponProficiencyGrantMode,
} from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

/** Projects class weapon proficiencies for API input from the active authoring mode. */
export function normalizeWeaponProficiencyGrantSet(input: {
  categories: readonly WeaponCategory[]
  items?: readonly string[]
  mode: WeaponProficiencyGrantMode
}): { categories: WeaponCategory[]; items: string[] } {
  return weaponProficiencyGrantSetFromMode(input.mode, {
    categories: input.categories,
    items: input.items ?? [],
  }) as { categories: WeaponCategory[]; items: string[] }
}
