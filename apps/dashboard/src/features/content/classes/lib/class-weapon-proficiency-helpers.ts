import type { WeaponCategory } from '@rpg/contracts'

/**
 * Resolves weapon proficiencies for API input: categories and named weapons are
 * mutually exclusive — the form toggle selects one mode or the other.
 */
export function normalizeClassWeaponProficiencies(input: {
  categories: readonly WeaponCategory[]
  items?: readonly string[]
  hasSpecificWeapons: boolean
}): { categories: WeaponCategory[]; items?: string[] } {
  if (input.hasSpecificWeapons) {
    const items = input.items ?? []
    return items.length ? { categories: [], items: [...items] } : { categories: [] }
  }

  return { categories: [...input.categories] }
}
