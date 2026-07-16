import type { LanguageProficiencyGrantSet } from '../../content/lib/proficiency-grant-set'
import { dedupeLanguageIds } from '../creature/languages'
import type { CharacterLanguageProficiencyEntry, CharacterProficiencies } from './proficiencies'

// ---------------------------------------------------------------------------
// Character language assembly — combines granted and selected language ids into
// the final character proficiency payload. No character-builder dependencies.
// ---------------------------------------------------------------------------

export const LANGUAGE_GRANTS_SOURCE_ID = 'language-grants' as const

export type DerivedCharacterLanguages = {
  items: string[]
}

/** Combines granted and selected language ids into a deduped proficiency grant set. */
export function assembleLanguageProficiencyIds(args: {
  grantedIds?: readonly string[]
  selectedIds?: readonly string[]
}): LanguageProficiencyGrantSet {
  const grantedIds = args.grantedIds ?? []
  const selectedIds = args.selectedIds ?? []

  return {
    categories: [],
    items: dedupeLanguageIds([...grantedIds, ...selectedIds]),
  }
}

/** Merges language proficiency rows, combining sources when the same language appears twice. */
export function mergeLanguageProficiencyEntries(
  entries: CharacterLanguageProficiencyEntry[],
): CharacterProficiencies['languages'] {
  const byLanguage = new Map<string, CharacterLanguageProficiencyEntry>()

  for (const entry of entries) {
    const existing = byLanguage.get(entry.language)
    if (!existing) {
      byLanguage.set(entry.language, entry)
      continue
    }

    byLanguage.set(entry.language, {
      language: entry.language,
      sources: [...(existing.sources ?? []), ...(entry.sources ?? [])],
      notes: existing.notes ?? entry.notes,
    })
  }

  return [...byLanguage.values()]
}
