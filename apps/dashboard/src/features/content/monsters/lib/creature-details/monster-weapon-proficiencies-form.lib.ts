import {
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyGrantSetFromTargets,
  creatureWeaponProficiencyTargetSchema,
  EMPTY_CREATURE_WEAPON_PROFICIENCIES,
  type CreatureWeaponProficiencies,
} from '@rpg/contracts'

import type { WeaponProficiencyMode } from '../../../classes/lib/class-form-constants'
import { weaponProficiencyModeFromGrantSet } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

/** Authoring default when no persisted weapon grants exist (empty grant set). */
export const MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE =
  'specific' as const satisfies WeaponProficiencyMode

/** Normalizes API/draft weapon proficiencies to the grant-set shape the form expects. */
export function coerceCreatureWeaponProficienciesForForm(
  weapons: unknown,
): CreatureWeaponProficiencies {
  const parsed = creatureWeaponProficienciesSchema.safeParse(weapons)
  if (parsed.success) return parsed.data

  if (Array.isArray(weapons)) {
    const targets = weapons.flatMap((row) => {
      const result = creatureWeaponProficiencyTargetSchema.safeParse(row)
      return result.success ? [result.data] : []
    })
    if (targets.length > 0) {
      return creatureWeaponProficiencyGrantSetFromTargets(targets)
    }
  }

  return { ...EMPTY_CREATURE_WEAPON_PROFICIENCIES }
}

export function weaponProficiencyHydrationFromWeapons(weapons: CreatureWeaponProficiencies): {
  mode: WeaponProficiencyMode
  reconciliationPending: boolean
} {
  const inferred = weaponProficiencyModeFromGrantSet(weapons)
  if (inferred.kind === 'mixed') {
    return { mode: 'categories', reconciliationPending: true }
  }
  if (inferred.mode === 'none') {
    return { mode: MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE, reconciliationPending: false }
  }
  return { mode: inferred.mode, reconciliationPending: false }
}
