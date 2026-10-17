import type { Equipment } from '@rpg/contracts'

import type { ContentFormOptionSets } from '../../form-options/content-form-options'

/** Resolves weapon grant item slugs to equipment display names for combobox chips. */
export function resolveContentWeaponGrantOptionLabel(
  slug: string,
  options?: Partial<ContentFormOptionSets>,
  equipmentById?: ReadonlyMap<string, Equipment>,
): string {
  const fromVisible = options?.equipment?.visible?.find(
    (item) => item.slug === slug || item.id === slug,
  )?.name
  if (fromVisible) return fromVisible

  const fromCatalog = equipmentById?.get(slug)
  if (fromCatalog) return fromCatalog.name

  for (const item of equipmentById?.values() ?? []) {
    if (item.slug === slug || item.id === slug) return item.name
  }

  return slug
}
