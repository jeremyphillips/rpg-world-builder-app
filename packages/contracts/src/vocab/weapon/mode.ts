import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Weapon mode — melee vs ranged.
// ---------------------------------------------------------------------------

export const WEAPON_MODES = ['melee', 'ranged'] as const

export const weaponModeSchema = z.enum(WEAPON_MODES)

export type WeaponMode = z.infer<typeof weaponModeSchema>

export const WEAPON_MODE_ENTRIES = {
  melee: {
    label: 'Melee',
    description: 'Used to make melee attacks against targets within your reach.',
  },
  ranged: {
    label: 'Ranged',
    description: 'Used to make ranged attacks against targets at a distance.',
  },
} as const satisfies Record<WeaponMode, GameTermEntry>

/** Returns the reference entry for a weapon mode, if known. */
export function getWeaponModeEntry(m: string): GameTermEntry | undefined {
  return WEAPON_MODE_ENTRIES[m as WeaponMode]
}

/** Returns the display label for a weapon mode. Falls back to the raw value. */
export function getWeaponModeLabel(m: string): string {
  return getWeaponModeEntry(m)?.label ?? m
}
