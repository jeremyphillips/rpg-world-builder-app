import { z } from 'zod'

import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'
import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry, VocabularyTerm } from './types'
import type { VocabularyOptionSetId } from './vocabulary'

/** Closed size entry. `rank` is relative magnitude; higher is larger. */
type CreatureSizeEntry = GameTermEntry & { readonly rank: number }

// ---------------------------------------------------------------------------
// Creature sizes — the closed SRD 5.2.1 size categories, shared by species,
// monsters, and any creature with a footprint. Relative order is `rank`
// (higher is larger), not object key order. Descriptions note grid space.
// Catalog seed order is not a second rank table.
// ---------------------------------------------------------------------------

export const CREATURE_SIZE_TERM = {
  label: 'Size',
  description: 'How much space a creature occupies on the battlefield.',
  sentence: {
    singular: 'size category',
    plural: 'size categories',
  },
} as const satisfies VocabularyTerm

export const CREATURE_SIZE_SET_ID = 'sizes' as const satisfies VocabularyOptionSetId

export const CREATURE_SIZE_ENTRIES = {
  tiny: {
    rank: 1,
    label: 'Tiny',
    description: 'A Tiny creature occupies a space 2½ feet on a side (e.g. a sprite, a cat).',
    sentence: {
      singular: 'tiny creature',
      plural: 'tiny creatures',
    },
  },
  small: {
    rank: 2,
    label: 'Small',
    description: 'A Small creature occupies a space 5 feet on a side (e.g. a halfling, a goblin).',
    sentence: {
      singular: 'small creature',
      plural: 'small creatures',
    },
  },
  medium: {
    rank: 3,
    label: 'Medium',
    description: 'A Medium creature occupies a space 5 feet on a side (e.g. a human, an orc).',
    sentence: {
      singular: 'medium creature',
      plural: 'medium creatures',
    },
  },
  large: {
    rank: 4,
    label: 'Large',
    description: 'A Large creature occupies a space 10 feet on a side (e.g. an ogre, a horse).',
    sentence: {
      singular: 'large creature',
      plural: 'large creatures',
    },
  },
  huge: {
    rank: 5,
    label: 'Huge',
    description:
      'A Huge creature occupies a space 15 feet on a side (e.g. a fire giant, a treant).',
    sentence: {
      singular: 'huge creature',
      plural: 'huge creatures',
    },
  },
  gargantuan: {
    rank: 6,
    label: 'Gargantuan',
    description:
      'A Gargantuan creature occupies a space 20 feet on a side or larger (e.g. a kraken, an ancient dragon).',
    sentence: {
      singular: 'gargantuan creature',
      plural: 'gargantuan creatures',
    },
  },
} as const satisfies Record<string, CreatureSizeEntry>

export type CreatureSize = keyof typeof CREATURE_SIZE_ENTRIES

/** Hit die faces by size — used for monster HP derivation. */
export const CREATURE_SIZE_HIT_DIE: Record<CreatureSize, number> = {
  tiny: 4,
  small: 6,
  medium: 8,
  large: 10,
  huge: 12,
  gargantuan: 20,
}

export const CREATURE_SIZES = keysFromEntries(CREATURE_SIZE_ENTRIES)

export const creatureSizeSchema = vocabEnumFromEntries(CREATURE_SIZE_ENTRIES)

const CREATURE_SIZES_MUST_BE_UNIQUE = 'Sizes must be unique.'

function refineUniqueCreatureSizes(sizes: readonly string[], ctx: z.RefinementCtx): void {
  if (new Set(sizes).size !== sizes.length) {
    addCustomRefinementIssue(ctx, CREATURE_SIZES_MUST_BE_UNIQUE)
  }
}

/** Published permitted sizes. At least one, no duplicates. Order is not canonical. */
export const creatureSizesSchema = z
  .array(creatureSizeSchema)
  .min(1)
  .superRefine(refineUniqueCreatureSizes)

/** Draft permitted sizes. Empty is allowed. Duplicates and unknown ids are not. */
export const creatureSizesDraftSchema = z
  .array(creatureSizeSchema)
  .default([])
  .superRefine(refineUniqueCreatureSizes)

export type CreatureSizeSortDirection = 'asc' | 'desc'

/**
 * Orders sizes by rank. Returns a new array and does not drop or unique members.
 * Equal ranks keep input order.
 */
export function sortCreatureSizes(
  sizes: readonly CreatureSize[],
  direction: CreatureSizeSortDirection = 'desc',
): CreatureSize[] {
  return sizes
    .map((size, index) => ({ size, index }))
    .sort((left, right) => {
      const delta = CREATURE_SIZE_ENTRIES[left.size].rank - CREATURE_SIZE_ENTRIES[right.size].rank
      const ranked = direction === 'desc' ? -delta : delta
      if (ranked !== 0) return ranked
      return left.index - right.index
    })
    .map((entry) => entry.size)
}

/** Highest-rank size, or `undefined` when `sizes` is empty. */
export function resolveLargestCreatureSize(
  sizes: readonly CreatureSize[],
): CreatureSize | undefined {
  if (sizes.length === 0) return undefined
  return sortCreatureSizes(sizes, 'desc')[0]
}

/**
 * Natural-language size list in descending rank.
 * `Medium`, `Medium or Small`, `Large, Medium, or Small`.
 */
export function formatCreatureSizeList(sizes: readonly CreatureSize[]): string {
  const labels = sortCreatureSizes(sizes).map((size) => getCreatureSizeLabel(size))
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  const rest = labels.slice(0, -1).join(', ')
  return `${rest}, or ${labels[labels.length - 1]}`
}

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
