import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Feat categories — closed SRD 5.2.1 set (v1). Homebrew-only categories may
// extend this map in a future ruleset or via a separate field.
// ---------------------------------------------------------------------------

export const FEAT_CATEGORY_TERM = {
  label: 'Feat Category',
  description: 'When or how a feat may be selected during character building.',
  sentence: {
    singular: 'feat category',
    plural: 'feat categories',
  },
} as const satisfies GameTermEntry

export const FEAT_CATEGORY_ENTRIES = {
  origin: {
    label: 'Origin',
    description:
      'A feat taken at character creation or when a feature grants an Origin feat choice.',
    sentence: {
      singular: 'origin feat',
      plural: 'origin feats',
    },
  },
  general: {
    label: 'General',
    description: 'A feat typically taken at level 4+ when a class grants a General feat choice.',
    sentence: {
      singular: 'general feat',
      plural: 'general feats',
    },
  },
  'fighting-style': {
    label: 'Fighting Style',
    description: 'A feat granted by the Fighting Style feature or similar class features.',
    sentence: {
      singular: 'fighting style feat',
      plural: 'fighting style feats',
    },
  },
  'epic-boon': {
    label: 'Epic Boon',
    description: 'A high-level feat typically taken at level 19+.',
    sentence: {
      singular: 'epic boon feat',
      plural: 'epic boon feats',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type FeatCategory = keyof typeof FEAT_CATEGORY_ENTRIES

export const FEAT_CATEGORY_IDS = keysFromEntries(FEAT_CATEGORY_ENTRIES)

export const featCategorySchema = vocabEnumFromEntries(FEAT_CATEGORY_ENTRIES)

/** Returns the reference entry for a feat category id, if known. */
export function getFeatCategoryEntry(id: string): GameTermEntry | undefined {
  return FEAT_CATEGORY_ENTRIES[id as FeatCategory]
}

/** Returns the display label for a feat category. Falls back to the raw id. */
export function getFeatCategoryLabel(id: string): string {
  return getFeatCategoryEntry(id)?.label ?? id
}

/** Counted noun phrase for generated feat-choice prose. */
export function getFeatCategorySentenceForm(id: string, count = 1): string {
  const entry = getFeatCategoryEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
}

// ---------------------------------------------------------------------------
// Parts of a Feat — SRD rules prose for contextual help (tooltips, authoring).
// Not stored on individual feat records.
// ---------------------------------------------------------------------------

export const FEAT_PART_TERM = {
  label: 'Feat Section',
  description: 'A labeled subsection of feat rules text.',
  sentence: {
    singular: 'feat section',
    plural: 'feat sections',
  },
} as const satisfies GameTermEntry

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

export const FEAT_PART_IDS = keysFromEntries(FEAT_PART_ENTRIES)

/** Returns the reference entry for a feat part id, if known. */
export function getFeatPartEntry(id: string): GameTermEntry | undefined {
  return FEAT_PART_ENTRIES[id as FeatPartId]
}

/** Returns the display label for a feat part id. Falls back to the raw id. */
export function getFeatPartLabel(id: string): string {
  return getFeatPartEntry(id)?.label ?? id
}
