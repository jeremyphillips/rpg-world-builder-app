import { z } from 'zod'

// ---------------------------------------------------------------------------
// Weapon mode — melee vs ranged.
// ---------------------------------------------------------------------------

export const WEAPON_MODES = ['melee', 'ranged'] as const

export const weaponModeSchema = z.enum(WEAPON_MODES)

export type WeaponMode = z.infer<typeof weaponModeSchema>
