import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'

import { formatVocabularySlugLabel } from '../format-slug-label'
import { getTermLabelSingular, getTermSentenceForm, type GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Armor categories — the closed SRD 5.2.1 category set. Used by class
// proficiencies, species grants, and the full armor content type.
// ---------------------------------------------------------------------------

export const ARMOR_CATEGORY_TERM = {
  label: 'Armor Category',
  description: 'Light, medium, or heavy armor classification.',
  sentence: {
    singular: 'armor category',
    plural: 'armor categories',
  },
} as const satisfies GameTermEntry

export const ARMOR_CATEGORY_ENTRIES = {
  light: {
    label: 'Light Armor',
    description: '1 minute to don or doff.',
    sentence: {
      singular: 'suit of light armor',
      plural: 'suits of light armor',
    },
  },
  medium: {
    label: 'Medium Armor',
    description: '5 minutes to don and 1 minute to doff.',
    sentence: {
      singular: 'suit of medium armor',
      plural: 'suits of medium armor',
    },
  },
  heavy: {
    label: 'Heavy Armor',
    description: '10 minutes to don and 5 minutes to doff.',
    sentence: {
      singular: 'suit of heavy armor',
      plural: 'suits of heavy armor',
    },
  },
  shields: {
    label: 'Shield',
    description: 'Utilize action to don or doff.',
    sentence: {
      singular: 'shield',
      plural: 'shields',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type ArmorCategory = keyof typeof ARMOR_CATEGORY_ENTRIES

export const ARMOR_CATEGORIES = keysFromEntries(ARMOR_CATEGORY_ENTRIES)

export const armorCategorySchema = vocabEnumFromEntries(ARMOR_CATEGORY_ENTRIES)

/** Returns the reference entry for an armor category, if known. */
export function getArmorCategoryEntry(c: string): GameTermEntry | undefined {
  return ARMOR_CATEGORY_ENTRIES[c as ArmorCategory]
}

/** Returns the display label for an armor category. Falls back to the raw value. */
export function getArmorCategoryLabel(c: string): string {
  return getArmorCategoryEntry(c)?.label ?? c
}

/** Counted noun phrase for generated armor-category prose (e.g. "suit of light armor"). */
export function getArmorCategorySentenceForm(category: string, count = 1): string {
  const entry = getArmorCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}

/** Lowercase scope phrase for armor training choice pools (e.g. "heavy armor"). */
export function getArmorCategoryScopeForm(category: string): string {
  const entry = getArmorCategoryEntry(category)
  if (entry) return getTermLabelSingular(entry.label)
  return getTermLabelSingular(formatVocabularySlugLabel(category))
}

/** Compact summary label for armor training grants (e.g. "Light armor"). */
export function getArmorCategoryCompactLabel(category: string): string {
  if (category === 'shields') return 'Shield'
  const entry = getArmorCategoryEntry(category)
  if (!entry) return formatVocabularySlugLabel(category)
  return entry.label.replace(/ Armor$/, ' armor')
}
