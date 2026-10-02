import { capitalizeFirst, vocabularyTermLabel, type VocabularyTerm } from '@rpg/contracts'

/** Homebrew hub / nav — product casing for plural taxonomy names. */
export function vocabularyHubLabel(term: VocabularyTerm): string {
  return vocabularyTermLabel(term, { number: 'plural', casing: 'title' })
}

/** Form field chrome — sentence-case singular or plural with leading capital. */
export function vocabularyFieldLabel(term: VocabularyTerm, options?: { plural?: boolean }): string {
  const phrase = vocabularyTermLabel(term, {
    number: options?.plural ? 'plural' : 'singular',
    casing: 'sentence',
  })
  return capitalizeFirst(phrase)
}
