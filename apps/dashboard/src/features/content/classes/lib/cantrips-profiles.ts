import type { EditableGridTemplate } from '@rpg/ui'

import { MAX_CHARACTER_LEVEL } from '@rpg/contracts'

/** Builds a level-1..N cantrip curve from SRD-style breakpoints (inclusive from each level onward until the next). */
function cantripCurve(breakpoints: { level: number; known: number }[]): (number | null)[] {
  const sorted = [...breakpoints].sort((a, b) => a.level - b.level)
  return Array.from({ length: MAX_CHARACTER_LEVEL }, (_, index) => {
    const level = index + 1
    let value: number | undefined
    for (const entry of sorted) {
      if (entry.level <= level) value = entry.known
    }
    return value ?? null
  })
}

/**
 * Seed-only cantrip progression presets for the class form grid.
 * Not part of the spellcasting contract — expands into the inline `cantrips` table on apply.
 */
export const CANTRIPS_KNOWN_PROFILES: EditableGridTemplate[] = [
  {
    name: 'Full caster (4 → 5 → 6)',
    values: cantripCurve([
      { level: 1, known: 4 },
      { level: 4, known: 5 },
      { level: 10, known: 6 },
    ]),
  },
  {
    name: 'Moderate (3 → 4 → 5)',
    values: cantripCurve([
      { level: 1, known: 3 },
      { level: 4, known: 4 },
      { level: 10, known: 5 },
    ]),
  },
  {
    name: 'Light (2 → 3 → 4)',
    values: cantripCurve([
      { level: 1, known: 2 },
      { level: 4, known: 3 },
      { level: 10, known: 4 },
    ]),
  },
]
