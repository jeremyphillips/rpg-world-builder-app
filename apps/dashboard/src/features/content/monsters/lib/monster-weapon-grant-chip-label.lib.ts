import type { Equipment } from '@rpg/contracts'

import type { ContentFormOptionSets } from '../../lib/form-options/content-form-options'
import { resolveContentWeaponGrantOptionLabel } from '../../lib/forms/grants/content-weapon-grant-option-label.lib'

/** @deprecated Use `resolveContentWeaponGrantOptionLabel`. */
export function resolveWeaponGrantChipLabel(
  slug: string,
  options?: Partial<ContentFormOptionSets>,
  equipmentById?: ReadonlyMap<string, Equipment>,
): string {
  return resolveContentWeaponGrantOptionLabel(slug, options, equipmentById)
}
