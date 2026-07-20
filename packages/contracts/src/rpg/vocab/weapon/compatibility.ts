import { joinNaturalList } from '../../primitives/prose'
import { getWeaponModeLabel, type WeaponMode } from './mode'
import { getWeaponMasteryLabel, type WeaponMastery } from './mastery'
import { getWeaponPropertyLabel, type WeaponProperty } from './property'

// ---------------------------------------------------------------------------
// Mode compatibility — properties and masteries that do not apply per mode.
// ---------------------------------------------------------------------------

/** Properties that cannot be selected when the weapon uses this mode. */
export const WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE = {
  melee: ['ammunition', 'loading'],
  ranged: ['reach', 'versatile'],
} as const satisfies Record<WeaponMode, readonly WeaponProperty[]>

/** Masteries that cannot be selected when the weapon uses this mode. */
export const WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE = {
  melee: [],
  ranged: ['cleave'],
} as const satisfies Record<WeaponMode, readonly WeaponMastery[]>

export interface WeaponPropertyModeAdvisory {
  property: WeaponProperty
  mode: WeaponMode
  message: string
}

const MODE_WEAPON_PHRASE: Record<WeaponMode, string> = {
  melee: 'melee weapons',
  ranged: 'ranged weapons',
}

function incompatiblePropertiesForMode(mode: WeaponMode): readonly WeaponProperty[] {
  return WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE[mode]
}

function incompatibleMasteriesForMode(mode: WeaponMode): readonly WeaponMastery[] {
  return WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE[mode]
}

function unavailableForModePhrase(mode: WeaponMode, subject: string): string {
  return `${subject} ${subject.includes(' and ') || subject.includes(', ') ? "aren't" : "isn't"} available for ${MODE_WEAPON_PHRASE[mode]}.`
}

/** Whether a property may be selected for the given weapon mode. */
export function isWeaponPropertyCompatibleWithMode(
  property: WeaponProperty,
  mode: WeaponMode,
): boolean {
  return !incompatiblePropertiesForMode(mode).includes(property)
}

/** Drops properties that are incompatible with the given mode. */
export function filterWeaponPropertiesForMode(
  properties: readonly WeaponProperty[],
  mode: WeaponMode,
): WeaponProperty[] {
  const incompatible = incompatiblePropertiesForMode(mode)
  return properties.filter((property) => !incompatible.includes(property))
}

/** Whether a mastery may be selected for the given weapon mode. */
export function isWeaponMasteryCompatibleWithMode(
  mastery: WeaponMastery,
  mode: WeaponMode,
): boolean {
  return !incompatibleMasteriesForMode(mode).includes(mastery)
}

/** Whether range fields should be shown (ranged mode or thrown property). */
export function weaponFormValuesHaveRange(values: {
  mode?: WeaponMode
  properties?: readonly WeaponProperty[]
}): boolean {
  if (values.mode === 'ranged') return true
  return Array.isArray(values.properties) && values.properties.includes('thrown')
}

/** Returns advisories for properties that conflict with the current mode. */
export function getWeaponPropertyModeAdvisories(values: {
  mode?: WeaponMode
  properties?: readonly WeaponProperty[]
}): readonly WeaponPropertyModeAdvisory[] {
  const { mode, properties } = values
  if (!mode || !Array.isArray(properties)) return []

  return properties
    .filter((property) => !isWeaponPropertyCompatibleWithMode(property, mode))
    .map((property) => ({
      property,
      mode,
      message: `${getWeaponPropertyLabel(property)} isn't compatible with ${getWeaponModeLabel(mode).toLowerCase()} weapons.`,
    }))
}

/**
 * Helper text listing properties disabled for the current mode.
 * Returns undefined when mode is unset or there are no disabled properties.
 */
export function formatWeaponPropertyModeHint(mode: WeaponMode | undefined): string | undefined {
  if (!mode) return undefined

  const labels = incompatiblePropertiesForMode(mode).map((property) =>
    getWeaponPropertyLabel(property),
  )
  if (labels.length === 0) return undefined

  return unavailableForModePhrase(mode, joinNaturalList(labels))
}

/**
 * Helper text listing masteries disabled for the current mode.
 * Returns undefined when mode is unset or there are no disabled masteries.
 */
export function formatWeaponMasteryModeHint(mode: WeaponMode | undefined): string | undefined {
  if (!mode) return undefined

  const labels = incompatibleMasteriesForMode(mode).map((mastery) => getWeaponMasteryLabel(mastery))
  if (labels.length === 0) return undefined

  return unavailableForModePhrase(mode, joinNaturalList(labels))
}
