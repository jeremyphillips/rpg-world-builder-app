import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Weapon mode — melee vs ranged.
// ---------------------------------------------------------------------------

export const WEAPON_MODE_TERM = {
  label: 'Weapon Mode',
  description: 'Whether a weapon is used in melee or at range.',
  sentence: {
    singular: 'weapon mode',
    plural: 'weapon modes',
  },
} as const satisfies GameTermEntry

export const WEAPON_MODE_ENTRIES = {
  melee: {
    label: 'Melee',
    description: 'Used to make melee attacks against targets within your reach.',
  },
  ranged: {
    label: 'Ranged',
    description: 'Used to make ranged attacks against targets at a distance.',
  },
} as const satisfies Record<string, GameTermEntry>

export type WeaponMode = keyof typeof WEAPON_MODE_ENTRIES

export const WEAPON_MODES = keysFromEntries(WEAPON_MODE_ENTRIES)

export const weaponModeSchema = vocabEnumFromEntries(WEAPON_MODE_ENTRIES)

/** Returns the reference entry for a weapon mode, if known. */
export function getWeaponModeEntry(m: string): GameTermEntry | undefined {
  return WEAPON_MODE_ENTRIES[m as WeaponMode]
}

/** Returns the display label for a weapon mode. Falls back to the raw value. */
export function getWeaponModeLabel(m: string): string {
  return getWeaponModeEntry(m)?.label ?? m
}
