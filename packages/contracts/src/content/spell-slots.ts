import type { SpellcastingProgression } from './class/spellcasting'

// ---------------------------------------------------------------------------
// Spell slot tables — 20-row arrays, one entry per character level.
// Each row is an array of slot counts indexed by slot level (0 = 1st-level).
// ---------------------------------------------------------------------------

/**
 * Full-caster progression (Bard, Cleric, Druid, Sorcerer, Wizard).
 * Rows 0–19 correspond to character levels 1–20.
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
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // L20
]

/**
 * Half-caster progression (Paladin, Ranger).
 * Rows 0–19 correspond to character levels 1–20.
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
  [4, 3, 3, 3, 2], // L20
]

/**
 * Pact Magic progression (Warlock).
 * All slots are at the highest unlocked spell level; zeros render as "—".
 * 5 elements per row (slot levels 1–5).
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
  [0, 0, 0, 0, 4], // L20
]

export const SLOT_TABLES: Record<SpellcastingProgression, number[][]> = {
  full: FULL_CASTER_SLOTS,
  half: HALF_CASTER_SLOTS,
  pact: PACT_CASTER_SLOTS,
}
