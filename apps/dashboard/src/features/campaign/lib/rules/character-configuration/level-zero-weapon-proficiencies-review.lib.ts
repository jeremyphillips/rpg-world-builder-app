import { WEAPON_CATEGORY_ENTRIES, type WeaponCategory } from '@rpg/contracts'

import {
  weaponProficiencyGrantSetFromMode,
  type WeaponProficiencyGrantMode,
} from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import type { LevelZeroNpcsFormValues } from './level-zero-npc-form-fields'

function formatWeaponCategories(categories: readonly string[]): string {
  return categories
    .map((category) => WEAPON_CATEGORY_ENTRIES[category as WeaponCategory]?.label ?? category)
    .join(', ')
}

/** Review-column summary for level-0 NPC weapon proficiency overrides (projected grant). */
export function formatLevelZeroWeaponProficienciesReview(
  values: Partial<
    Pick<LevelZeroNpcsFormValues, 'levelZeroWeaponGrantMode' | 'levelZeroWeaponProficiencies'>
  >,
): string {
  const mode: WeaponProficiencyGrantMode = values.levelZeroWeaponGrantMode ?? 'none'
  const projected = weaponProficiencyGrantSetFromMode(
    mode,
    values.levelZeroWeaponProficiencies ?? { categories: [], items: [] },
  )

  if (mode === 'none' || (projected.categories.length === 0 && projected.items.length === 0)) {
    return 'None'
  }
  if (projected.items.length > 0) {
    return projected.items.join(', ')
  }
  return formatWeaponCategories(projected.categories)
}
