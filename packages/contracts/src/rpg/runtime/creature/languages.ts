import type { LanguageProficiencyGrantSet } from '../../content/lib/grants/proficiency-grant-set'
import type { LanguageSeedOption } from '../../vocab/language'

// ---------------------------------------------------------------------------
// Creature language primitives — resolves language ids from grants and choice
// sources against catalog vocabulary. Reusable across character, NPC, and
// monster runtime surfaces; no builder or character-sheet dependencies.
// ---------------------------------------------------------------------------

export type CreatureLanguageOption = LanguageSeedOption

/** Returns unique language ids preserving first-seen order. */
export function dedupeLanguageIds(languageIds: readonly string[]): string[] {
  return [...new Set(languageIds)]
}

/** Resolves catalog language rows from explicit ids and/or vocabulary categories. */
export function resolveLanguagesFromChoiceSource(args: {
  languages: readonly CreatureLanguageOption[]
  from?: readonly string[]
  categories?: readonly string[]
}): CreatureLanguageOption[] {
  const { languages, from = [], categories = [] } = args

  if (from.length > 0) {
    const byId = new Map(languages.map((language) => [language.id, language]))
    return from.flatMap((id) => {
      const language = byId.get(id)
      return language ? [language] : []
    })
  }

  if (categories.length > 0) {
    return languages.filter((language) => categories.includes(language.category))
  }

  return []
}

/** Expands a language proficiency grant set into deduped language ids. */
export function resolveLanguageIdsFromGrantSet(args: {
  grantSet?: LanguageProficiencyGrantSet
  languages: readonly CreatureLanguageOption[]
}): string[] {
  const grantSet = args.grantSet ?? { categories: [], items: [] }
  const fromCategories = grantSet.categories.flatMap((category) =>
    args.languages
      .filter((language) => language.category === category)
      .map((language) => language.id),
  )

  return dedupeLanguageIds([...grantSet.items, ...fromCategories])
}
