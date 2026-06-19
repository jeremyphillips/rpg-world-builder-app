import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Creature sizes — the closed SRD 5.2.1 size categories, shared by species,
// monsters, and any creature with a footprint. Ordered smallest to largest;
// descriptions note the space each size occupies on a grid.
// ---------------------------------------------------------------------------

export const CREATURE_SIZE_ENTRIES = {
  tiny: {
    label: 'Tiny',
    description: 'A Tiny creature occupies a space 2½ feet on a side (e.g. a sprite, a cat).',
  },
  small: {
    label: 'Small',
    description: 'A Small creature occupies a space 5 feet on a side (e.g. a halfling, a goblin).',
  },
  medium: {
    label: 'Medium',
    description: 'A Medium creature occupies a space 5 feet on a side (e.g. a human, an orc).',
  },
  large: {
    label: 'Large',
    description: 'A Large creature occupies a space 10 feet on a side (e.g. an ogre, a horse).',
  },
  huge: {
    label: 'Huge',
    description:
      'A Huge creature occupies a space 15 feet on a side (e.g. a fire giant, a treant).',
  },
  gargantuan: {
    label: 'Gargantuan',
    description:
      'A Gargantuan creature occupies a space 20 feet on a side or larger (e.g. a kraken, an ancient dragon).',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureSize = keyof typeof CREATURE_SIZE_ENTRIES

export const CREATURE_SIZES = Object.keys(CREATURE_SIZE_ENTRIES) as [
  CreatureSize,
  ...CreatureSize[],
]

export const creatureSizeSchema = z.enum(CREATURE_SIZES)

/** Returns the reference entry for a creature size id, if known. */
export function getCreatureSizeEntry(id: string): GameTermEntry | undefined {
  return CREATURE_SIZE_ENTRIES[id as CreatureSize]
}

/** Returns the display label for a creature size id. Falls back to the raw value. */
export function getCreatureSizeLabel(id: string): string {
  return getCreatureSizeEntry(id)?.label ?? id
}
