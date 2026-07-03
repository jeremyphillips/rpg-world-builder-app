import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Feat categories — closed SRD 5.2.1 set (v1). Homebrew-only categories may
// extend this map in a future ruleset or via a separate field.
// ---------------------------------------------------------------------------

export const FEAT_CATEGORY_ENTRIES = {
  origin: {
    label: 'Origin',
    description:
      'A feat taken at character creation or when a feature grants an Origin feat choice.',
  },
  general: {
    label: 'General',
    description: 'A feat typically taken at level 4+ when a class grants a General feat choice.',
  },
  'fighting-style': {
    label: 'Fighting Style',
    description: 'A feat granted by the Fighting Style feature or similar class features.',
  },
  'epic-boon': {
    label: 'Epic Boon',
    description: 'A high-level feat typically taken at level 19+.',
  },
} as const satisfies Record<string, GameTermEntry>

export type FeatCategory = keyof typeof FEAT_CATEGORY_ENTRIES

export const FEAT_CATEGORY_IDS = Object.keys(FEAT_CATEGORY_ENTRIES) as [
  FeatCategory,
  ...FeatCategory[],
]

export const featCategorySchema = z.enum(FEAT_CATEGORY_IDS)

/** Returns the reference entry for a feat category id, if known. */
export function getFeatCategoryEntry(id: string): GameTermEntry | undefined {
  return FEAT_CATEGORY_ENTRIES[id as FeatCategory]
}

/** Returns the display label for a feat category. Falls back to the raw id. */
export function getFeatCategoryLabel(id: string): string {
  return getFeatCategoryEntry(id)?.label ?? id
}

// ---------------------------------------------------------------------------
// Parts of a Feat — SRD rules prose for contextual help (tooltips, authoring).
// Not stored on individual feat records.
// ---------------------------------------------------------------------------

export const FEAT_PART_ENTRIES = {
  benefit: {
    label: 'Benefit',
    description:
      'The benefits of a feat are detailed after any prerequisites are listed. If you have a feat, you gain its benefits.',
  },
  repeatable: {
    label: 'Repeatable',
    description:
      'A feat can be taken only once unless its description states otherwise in a “Repeatable” subsection.',
  },
} as const satisfies Record<string, GameTermEntry>

export type FeatPartId = keyof typeof FEAT_PART_ENTRIES

export const FEAT_PART_IDS = Object.keys(FEAT_PART_ENTRIES) as [FeatPartId, ...FeatPartId[]]

/** Returns the reference entry for a feat part id, if known. */
export function getFeatPartEntry(id: string): GameTermEntry | undefined {
  return FEAT_PART_ENTRIES[id as FeatPartId]
}

/** Returns the display label for a feat part id. Falls back to the raw id. */
export function getFeatPartLabel(id: string): string {
  return getFeatPartEntry(id)?.label ?? id
}
