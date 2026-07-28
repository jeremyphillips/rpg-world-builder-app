import { joinNaturalList } from '../prose'
import {
  WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE,
  WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE,
} from '../../vocab/weapon/compatibility'
import { getWeaponMasteryLabel } from '../../vocab/weapon/mastery'
import { type WeaponMode } from '../../vocab/weapon/mode'
import { getWeaponPropertyLabel } from '../../vocab/weapon/property'

const MODE_WEAPON_PHRASE: Record<WeaponMode, string> = {
  melee: 'melee weapons',
  ranged: 'ranged weapons',
}

function unavailableForModePhrase(mode: WeaponMode, subject: string): string {
  return `${subject} ${subject.includes(' and ') || subject.includes(', ') ? "aren't" : "isn't"} available for ${MODE_WEAPON_PHRASE[mode]}.`
}

/**
 * Helper text listing properties disabled for the current mode.
 * Returns undefined when mode is unset or there are no disabled properties.
 */
export function formatWeaponPropertyModeHint(mode: WeaponMode | undefined): string | undefined {
  if (!mode) return undefined

  const labels = WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE[mode].map((property) =>
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

  const labels = WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE[mode].map((mastery) =>
    getWeaponMasteryLabel(mastery),
  )
  if (labels.length === 0) return undefined

  return unavailableForModePhrase(mode, joinNaturalList(labels))
}
