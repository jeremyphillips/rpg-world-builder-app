import { vocabularyTermLabel, type VocabularyTerm } from '@rpg/contracts'

/** Capitalizes the first letter of each word for hub and navigation surfaces. */
function titleCaseWords(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase())
}

/** Homebrew hub / nav — product casing for plural taxonomy names. */
export function vocabularyHubLabel(term: VocabularyTerm): string {
  const phrase = vocabularyTermLabel(term, { number: 'plural', casing: 'sentence' })
  return titleCaseWords(phrase)
}

/** Form field chrome — sentence-case singular or plural with leading capital. */
export function vocabularyFieldLabel(term: VocabularyTerm, options?: { plural?: boolean }): string {
  const phrase = vocabularyTermLabel(term, {
    number: options?.plural ? 'plural' : 'singular',
    casing: 'sentence',
  })
  return phrase.charAt(0).toUpperCase() + phrase.slice(1)
}
