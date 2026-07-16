import type { SpellcastingProgression } from './spellcasting'

// ---------------------------------------------------------------------------
// Spell slot tables — one row per character level.
// Each row is an array of slot counts indexed by slot level (0 = 1st-level).
// ---------------------------------------------------------------------------

const L20_FULL = [4, 3, 3, 3, 3, 2, 2, 1, 1] // L20
const L20_HALF = [4, 3, 3, 3, 2] // L20
const L20_PACT = [0, 0, 0, 0, 4] // L20

/**
 * Full-caster progression (Bard, Cleric, Druid, Sorcerer, Wizard).
 * Rows 0–29 correspond to character levels 1–30.
 * L21–L30 extrapolate L20 slot counts (no official 5e epic tables).
 */
export const FULL_CASTER_SLOTS: number[][] = [
  [2], // L1
  [3], // L2
  [4, 2], // L3
  [4, 3], // L4
  [4, 3, 2], // L5
  [4, 3, 3], // L6
  [4, 3, 3, 1], // L7
  [4, 3, 3, 2], // L8
  [4, 3, 3, 3, 1], // L9
  [4, 3, 3, 3, 2], // L10
  [4, 3, 3, 3, 2, 1], // L11
  [4, 3, 3, 3, 2, 1], // L12
  [4, 3, 3, 3, 2, 1, 1], // L13
  [4, 3, 3, 3, 2, 1, 1], // L14
  [4, 3, 3, 3, 2, 1, 1, 1], // L15
  [4, 3, 3, 3, 2, 1, 1, 1], // L16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // L17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // L18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // L19
  L20_FULL, // L20
  L20_FULL, // L21
  L20_FULL, // L22
  L20_FULL, // L23
  L20_FULL, // L24
  L20_FULL, // L25
  L20_FULL, // L26
  L20_FULL, // L27
  L20_FULL, // L28
  L20_FULL, // L29
  L20_FULL, // L30
]

/**
 * Half-caster progression (Paladin, Ranger).
 * L21–L30 extrapolate L20 slot counts.
 */
export const HALF_CASTER_SLOTS: number[][] = [
  [2], // L1
  [2], // L2
  [3], // L3
  [3], // L4
  [4, 2], // L5
  [4, 2], // L6
  [4, 3], // L7
  [4, 3], // L8
  [4, 3, 2], // L9
  [4, 3, 2], // L10
  [4, 3, 3], // L11
  [4, 3, 3], // L12
  [4, 3, 3, 1], // L13
  [4, 3, 3, 1], // L14
  [4, 3, 3, 2], // L15
  [4, 3, 3, 2], // L16
  [4, 3, 3, 3, 1], // L17
  [4, 3, 3, 3, 1], // L18
  [4, 3, 3, 3, 2], // L19
  L20_HALF, // L20
  L20_HALF, // L21
  L20_HALF, // L22
  L20_HALF, // L23
  L20_HALF, // L24
  L20_HALF, // L25
  L20_HALF, // L26
  L20_HALF, // L27
  L20_HALF, // L28
  L20_HALF, // L29
  L20_HALF, // L30
]

/**
 * Pact Magic progression (Warlock).
 * All slots are at the highest unlocked spell level; zeros render as "—".
 * L21–L30 repeat L20 pact slot row.
 */
export const PACT_CASTER_SLOTS: number[][] = [
  [1, 0, 0, 0, 0], // L1
  [2, 0, 0, 0, 0], // L2
  [0, 2, 0, 0, 0], // L3
  [0, 2, 0, 0, 0], // L4
  [0, 0, 2, 0, 0], // L5
  [0, 0, 2, 0, 0], // L6
  [0, 0, 0, 2, 0], // L7
  [0, 0, 0, 2, 0], // L8
  [0, 0, 0, 0, 2], // L9
  [0, 0, 0, 0, 2], // L10
  [0, 0, 0, 0, 3], // L11
  [0, 0, 0, 0, 3], // L12
  [0, 0, 0, 0, 3], // L13
  [0, 0, 0, 0, 3], // L14
  [0, 0, 0, 0, 3], // L15
  [0, 0, 0, 0, 3], // L16
  [0, 0, 0, 0, 4], // L17
  [0, 0, 0, 0, 4], // L18
  [0, 0, 0, 0, 4], // L19
  L20_PACT, // L20
  L20_PACT, // L21
  L20_PACT, // L22
  L20_PACT, // L23
  L20_PACT, // L24
  L20_PACT, // L25
  L20_PACT, // L26
  L20_PACT, // L27
  L20_PACT, // L28
  L20_PACT, // L29
  L20_PACT, // L30
]

export const SLOT_TABLES: Record<SpellcastingProgression, number[][]> = {
  full: FULL_CASTER_SLOTS,
  half: HALF_CASTER_SLOTS,
  pact: PACT_CASTER_SLOTS,
}

/** Slot row for character level (1-based); falls back to last table row when out of range. */
export function getSlotRow(table: number[][], level: number): number[] | undefined {
  if (level < 1) return undefined
  const row = table[level - 1]
  if (row !== undefined) return row
  return table.at(-1)
}
