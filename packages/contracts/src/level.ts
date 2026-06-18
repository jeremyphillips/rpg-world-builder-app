import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character level — the shared 1–20 bound for class progression fields
// (ASI levels, subclass levels, feature levels, ...).
// ---------------------------------------------------------------------------

export const MAX_CHARACTER_LEVEL = 20

export const levelSchema = z.number().int().min(1).max(MAX_CHARACTER_LEVEL)

/** A number bounded by Zod (1–20); not a TS literal union. */
export type Level = z.infer<typeof levelSchema>

/** Standard D&D proficiency bonus: +2 at L1, increases by +1 every 4 levels. */
export function proficiencyBonus(level: Level): number {
  return Math.floor((level - 1) / 4) + 2
}
