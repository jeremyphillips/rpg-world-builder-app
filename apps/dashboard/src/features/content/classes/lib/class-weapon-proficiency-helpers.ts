import { WEAPON_CATEGORIES, type WeaponCategory } from '@rpg/contracts'

export type WeaponCategoryBySlug = Readonly<Partial<Record<string, WeaponCategory>>>

function categoriesUsedByItems(
  items: readonly string[],
  categoryBySlug: WeaponCategoryBySlug,
): Set<WeaponCategory> {
  const used = new Set<WeaponCategory>()
  for (const slug of items) {
    const category = categoryBySlug[slug]
    if (category) used.add(category)
  }
  return used
}

function stripItemsCoveredByCategories(
  items: readonly string[],
  categories: readonly WeaponCategory[],
  categoryBySlug: WeaponCategoryBySlug,
): string[] {
  const covered = new Set(categories)
  return items.filter((slug) => {
    const category = categoryBySlug[slug]
    return category === undefined || !covered.has(category)
  })
}

/** Whether specific-weapon UI is meaningful (not both weapon categories). */
export function specificWeaponFieldsAllowed(selectedCategories: unknown): boolean {
  if (!Array.isArray(selectedCategories)) return true
  return selectedCategories.length < WEAPON_CATEGORIES.length
}

function stripCategoriesConflictingWithItems(
  categories: readonly WeaponCategory[],
  items: readonly string[],
  categoryBySlug: WeaponCategoryBySlug,
): WeaponCategory[] {
  const categoriesWithItems = categoriesUsedByItems(items, categoryBySlug)
  return categories.filter((category) => !categoriesWithItems.has(category))
}

function allItemsInSelectedCategories(
  items: readonly string[],
  categories: readonly WeaponCategory[],
  categoryBySlug: WeaponCategoryBySlug,
): boolean {
  if (items.length === 0) return false
  const selected = new Set(categories)
  return items.every((slug) => {
    const category = categoryBySlug[slug]
    return category !== undefined && selected.has(category)
  })
}

/**
 * Resolves weapon proficiencies for API input: omits items when the toggle is
 * off, drops redundant category/item pairs using the campaign weapon catalog.
 */
export function normalizeClassWeaponProficiencies(input: {
  categories: readonly WeaponCategory[]
  items?: readonly string[]
  hasSpecificWeapons: boolean
  categoryBySlug?: WeaponCategoryBySlug
}): { categories: WeaponCategory[]; items?: string[] } {
  const categoryBySlug = input.categoryBySlug ?? {}

  if (!input.hasSpecificWeapons || !specificWeaponFieldsAllowed(input.categories)) {
    return { categories: [...input.categories] }
  }

  const categories = [...input.categories]
  const originalItems = input.items ?? []
  const redundantItemsStripped = stripItemsCoveredByCategories(
    originalItems,
    categories,
    categoryBySlug,
  )

  if (
    originalItems.length > 0 &&
    redundantItemsStripped.length === 0 &&
    allItemsInSelectedCategories(originalItems, categories, categoryBySlug)
  ) {
    const categoriesToDrop = categoriesUsedByItems(originalItems, categoryBySlug)
    return {
      categories: categories.filter((category) => !categoriesToDrop.has(category)),
      items: [...originalItems],
    }
  }

  const normalizedCategories = stripCategoriesConflictingWithItems(
    categories,
    redundantItemsStripped,
    categoryBySlug,
  )
  const items = stripItemsCoveredByCategories(
    redundantItemsStripped,
    normalizedCategories,
    categoryBySlug,
  )

  if (!specificWeaponFieldsAllowed(normalizedCategories)) {
    return { categories: normalizedCategories }
  }

  return {
    categories: normalizedCategories,
    ...(items.length ? { items } : {}),
  }
}
