import type { WeaponCategory } from '@rpg/contracts'

/**
 * Resolves weapon proficiencies for API input: categories and named weapons are
 * mutually exclusive — the proficiency mode radio selects one or the other.
 */
export function normalizeClassWeaponProficiencies(input: {
  categories: readonly WeaponCategory[]
  items?: readonly string[]
  hasSpecificWeapons: boolean
}): { categories: WeaponCategory[]; items: string[] } {
  if (input.hasSpecificWeapons) {
    const items = input.items ?? []
    return { categories: [], items: [...items] }
  }

  return { categories: [...input.categories], items: [] }
}
