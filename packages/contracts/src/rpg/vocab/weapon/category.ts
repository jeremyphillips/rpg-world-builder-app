import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import { formatVocabularySlugLabel } from '../format-slug-label'
import { getTermSentenceForm, type GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Weapon categories — simple/martial taxonomy consumed by class proficiencies
// and the full weapon content type.
// ---------------------------------------------------------------------------

export const WEAPON_CATEGORY_ENTRIES = {
  simple: {
    label: 'Simple Weapon',
    description:
      'Simple weapons are easy to use. Most creatures can wield a simple weapon even without training.',
    sentence: {
      singular: 'simple weapon',
      plural: 'simple weapons',
    },
  },
  martial: {
    label: 'Martial Weapon',
    description:
      'Martial weapons require training to use effectively. Most warriors use martial weapons because of their superior damage and versatility.',
    sentence: {
      singular: 'martial weapon',
      plural: 'martial weapons',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type WeaponCategory = keyof typeof WEAPON_CATEGORY_ENTRIES

export const WEAPON_CATEGORIES = keysFromEntries(WEAPON_CATEGORY_ENTRIES)

export const weaponCategorySchema = vocabEnumFromEntries(WEAPON_CATEGORY_ENTRIES)

/** Returns the reference entry for a weapon category, if known. */
export function getWeaponCategoryEntry(c: string): GameTermEntry | undefined {
  return WEAPON_CATEGORY_ENTRIES[c as WeaponCategory]
}

/** Returns the display label for a weapon category. Falls back to the raw value. */
export function getWeaponCategoryLabel(c: string): string {
  return getWeaponCategoryEntry(c)?.label ?? c
}

/** Counted noun phrase for generated weapon-category prose. */
export function getWeaponCategorySentenceForm(category: string, count = 1): string {
  const entry = getWeaponCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}

/** Compact summary label for proficiency grants (e.g. "Simple weapons"). */
export function getWeaponCategoryCompactLabel(category: string): string {
  const entry = getWeaponCategoryEntry(category)
  if (entry) {
    const phrase = getTermSentenceForm(entry, 2)
    return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`
  }
  return `${formatVocabularySlugLabel(category)} weapons`
}
