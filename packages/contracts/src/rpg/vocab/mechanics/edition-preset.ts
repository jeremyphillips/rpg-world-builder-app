import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { VocabularyOptionSetId } from '../vocabulary'
import { getTermSentenceForm } from '../types'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Edition presets — rules-era bundles for campaign mechanics configuration.
// Seed data lives in `@rpg/catalog/vocabulary`; internal-only (no hub manager).
// ---------------------------------------------------------------------------

export const EDITION_PRESET_SET_ID = 'edition-presets' as const satisfies VocabularyOptionSetId

type EditionPresetEntry = GameTermEntry & { readonly meta: readonly string[] }

export const EDITION_PRESET_TERM = {
  label: 'Edition Preset',
  description: 'A rules-era bundle for campaign mechanics configuration.',
  sentence: {
    singular: 'edition preset',
    plural: 'edition presets',
  },
} as const satisfies GameTermEntry

export const EDITION_PRESET_ENTRIES = {
  becmi: {
    label: 'Classic Basic',
    description:
      'Fast old-school play with descending armor class, class tables, simple saves, and lightweight character options.',
    meta: ['Descending AC', 'Class tables', 'Simple saves'],
    sentence: {
      singular: 'classic basic rules',
      plural: 'classic basic rules',
    },
  },
  '1e': {
    label: 'Advanced Classic 1e',
    description:
      'A stricter classic framework with table-driven combat, granular saves, and more detailed class structure.',
    meta: ['Descending AC', 'Combat tables', 'Category saves'],
    sentence: {
      singular: 'advanced classic 1e rules',
      plural: 'advanced classic 1e rules',
    },
  },
  '2e': {
    label: 'Advanced Classic 2e',
    description:
      'A refined classic framework with THAC0-style attacks, class advancement, and broader character customization.',
    meta: ['Descending AC', 'THAC0-style attacks', 'Category saves'],
    sentence: {
      singular: 'advanced classic 2e rules',
      plural: 'advanced classic 2e rules',
    },
  },
  '3e': {
    label: 'Modern 3e',
    description:
      'A detailed d20 framework with ascending armor class, attack bonuses, Fortitude/Reflex/Will saves, skill ranks, feats, and more granular character customization.',
    meta: ['Ascending AC', 'Attack bonuses', 'Fort/Ref/Will', 'Skills & feats'],
    sentence: {
      singular: 'modern 3e rules',
      plural: 'modern 3e rules',
    },
  },
  '5e': {
    label: 'Modern 5e',
    description:
      'A familiar modern fantasy rules framework with ascending armor class, proficiency-based advancement, ability checks, saving throws, and standardized d20 combat.',
    meta: ['Ascending AC', 'Proficiency bonus', 'Ability checks', 'Saving throws'],
    sentence: {
      singular: 'modern 5e rules',
      plural: 'modern 5e rules',
    },
  },
} as const satisfies Record<string, EditionPresetEntry>

export type EditionPresetId = keyof typeof EDITION_PRESET_ENTRIES

export const EDITION_PRESET_IDS = keysFromEntries(EDITION_PRESET_ENTRIES)

/** UI display order for edition presets — most recent era first. */
export const EDITION_PRESET_DISPLAY_ORDER = [
  '5e',
  '3e',
  '2e',
  '1e',
  'becmi',
] as const satisfies readonly EditionPresetId[]

export const editionPresetIdSchema = vocabEnumFromEntries(EDITION_PRESET_ENTRIES)

export const DEFAULT_EDITION_PRESET_ID = '5e' as const satisfies EditionPresetId

/** Sorts edition preset ids by {@link EDITION_PRESET_DISPLAY_ORDER}; unknown ids sort last. */
export function sortEditionPresetIds(ids: Iterable<string>): string[] {
  const order = new Map(EDITION_PRESET_DISPLAY_ORDER.map((id, index) => [id, index]))
  return [...ids].sort(
    (a, b) =>
      (order.get(a as EditionPresetId) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(b as EditionPresetId) ?? Number.MAX_SAFE_INTEGER),
  )
}

/** Returns the reference entry for an edition preset id, if known. */
export function getEditionPresetEntry(id: string): EditionPresetEntry | undefined {
  return EDITION_PRESET_ENTRIES[id as EditionPresetId]
}

/** Returns the display label for an edition preset. Falls back to the raw value. */
export function getEditionPresetLabel(id: string): string {
  return getEditionPresetEntry(id)?.label ?? id
}

/** Phrase for generated edition-preset prose. */
export function getEditionPresetSentenceForm(id: string, count = 1): string {
  const entry = getEditionPresetEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
}
