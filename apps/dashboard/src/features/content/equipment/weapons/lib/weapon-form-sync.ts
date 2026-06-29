import {
  filterWeaponPropertiesForMode,
  isWeaponMasteryCompatibleWithMode,
  type WeaponMastery,
  type WeaponMode,
  type WeaponProperty,
} from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

/** Tier-1 sync: strip incompatible properties and mastery when mode changes (not on load). */
export function applyWeaponModeValueSync(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const mode = values.mode as WeaponMode | undefined
  if (!mode) return undefined

  const properties = Array.isArray(values.properties)
    ? (values.properties as WeaponProperty[])
    : []
  const filteredProperties = filterWeaponPropertiesForMode(properties, mode)

  const patch: Partial<Record<string, unknown>> = {}

  if (filteredProperties.length !== properties.length) {
    patch.properties = filteredProperties
  }

  if (properties.includes('versatile') && !filteredProperties.includes('versatile')) {
    patch.versatileDamage = undefined
  }

  const mastery = values.mastery as WeaponMastery | undefined
  if (mastery && !isWeaponMasteryCompatibleWithMode(mastery, mode)) {
    patch.mastery = undefined
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

/** Pass to `<Form valueSyncs={…}>` on weapon equipment create/edit. */
export const weaponFormValueSyncs: FormValueSync[] = [
  {
    dependsOn: ['mode'],
    apply: (values, changedKeys) =>
      changedKeys.includes('mode') ? applyWeaponModeValueSync(values) : undefined,
  },
]
