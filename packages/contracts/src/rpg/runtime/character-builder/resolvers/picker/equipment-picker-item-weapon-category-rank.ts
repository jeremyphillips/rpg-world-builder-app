import type { Equipment } from '../../../../content/equipment'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import type { WeaponCategory } from '../../../../vocab/weapon/category'

/**
 * Weapon category rank is a contextual browse tiebreaker only.
 *
 * It applies after recommendation tier, reason, and equipment kind.
 * It exists so classes proficient with both simple and martial weapons
 * see martial options before simple options when otherwise equivalent.
 *
 * It must not affect Recommended-tab membership or search scoring.
 */
export const EQUIPMENT_RECOMMENDATION_WEAPON_CATEGORY_RANK = {
  martial: 0,
  simple: 1,
} as const satisfies Record<WeaponCategory, number>

/** True when assembled proficiencies include both simple and martial weapon categories. */
export function characterPrefersMartialWeaponBrowseOrder(
  proficiencies: CharacterProficiencies,
): boolean {
  const categories = new Set(
    proficiencies.weapons
      .map((entry) => entry.weaponCategory)
      .filter((category): category is WeaponCategory => category !== undefined),
  )
  return categories.has('simple') && categories.has('martial')
}

export function getEquipmentWeaponCategoryBrowseRank(
  equipment: Equipment,
  preferMartial: boolean,
): number {
  if (!preferMartial || equipment.kind !== 'weapon') {
    return 0
  }

  return EQUIPMENT_RECOMMENDATION_WEAPON_CATEGORY_RANK[equipment.category] ?? 0
}
