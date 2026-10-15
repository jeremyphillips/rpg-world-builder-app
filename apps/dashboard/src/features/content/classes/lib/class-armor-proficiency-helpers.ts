import type { ArmorCategory } from '@rpg/contracts'

/** Resolves armor proficiencies for API input (categories vs named armor are mutually exclusive). */
export function normalizeArmorProficiencyGrantSet(input: {
  categories: readonly ArmorCategory[]
  items?: readonly string[]
  hasSpecificArmor: boolean
}): { categories: ArmorCategory[]; items: string[] } {
  if (input.hasSpecificArmor) {
    const items = input.items ?? []
    return { categories: [], items: [...items] }
  }

  return { categories: [...input.categories], items: [] }
}
