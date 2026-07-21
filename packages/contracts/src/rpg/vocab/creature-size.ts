import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Creature sizes — the closed SRD 5.2.1 size categories, shared by species,
// monsters, and any creature with a footprint. Ordered smallest to largest;
// descriptions note the space each size occupies on a grid.
// ---------------------------------------------------------------------------

export const CREATURE_SIZE_TERM = {
  label: 'Size',
  description: 'How much space a creature occupies on the battlefield.',
  sentence: {
    singular: 'size category',
    plural: 'size categories',
  },
} as const satisfies GameTermEntry

export const CREATURE_SIZE_ENTRIES = {
  tiny: {
    label: 'Tiny',
    description: 'A Tiny creature occupies a space 2½ feet on a side (e.g. a sprite, a cat).',
    sentence: {
      singular: 'tiny creature',
      plural: 'tiny creatures',
    },
  },
  small: {
    label: 'Small',
    description: 'A Small creature occupies a space 5 feet on a side (e.g. a halfling, a goblin).',
    sentence: {
      singular: 'small creature',
      plural: 'small creatures',
    },
  },
  medium: {
    label: 'Medium',
    description: 'A Medium creature occupies a space 5 feet on a side (e.g. a human, an orc).',
    sentence: {
      singular: 'medium creature',
      plural: 'medium creatures',
    },
  },
  large: {
    label: 'Large',
    description: 'A Large creature occupies a space 10 feet on a side (e.g. an ogre, a horse).',
    sentence: {
      singular: 'large creature',
      plural: 'large creatures',
    },
  },
  huge: {
    label: 'Huge',
    description:
      'A Huge creature occupies a space 15 feet on a side (e.g. a fire giant, a treant).',
    sentence: {
      singular: 'huge creature',
      plural: 'huge creatures',
    },
  },
  gargantuan: {
    label: 'Gargantuan',
    description:
      'A Gargantuan creature occupies a space 20 feet on a side or larger (e.g. a kraken, an ancient dragon).',
    sentence: {
      singular: 'gargantuan creature',
      plural: 'gargantuan creatures',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureSize = keyof typeof CREATURE_SIZE_ENTRIES

export const CREATURE_SIZES = keysFromEntries(CREATURE_SIZE_ENTRIES)

export const creatureSizeSchema = vocabEnumFromEntries(CREATURE_SIZE_ENTRIES)

/** Returns the reference entry for a creature size id, if known. */
export function getCreatureSizeEntry(id: string): GameTermEntry | undefined {
  return CREATURE_SIZE_ENTRIES[id as CreatureSize]
}

/** Returns the display label for a creature size id. Falls back to the raw value. */
export function getCreatureSizeLabel(id: string): string {
  return getCreatureSizeEntry(id)?.label ?? id
}

/** Counted noun phrase for generated creature-size prose. */
export function getCreatureSizeSentenceForm(id: string, count = 1): string {
  const entry = getCreatureSizeEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
}
