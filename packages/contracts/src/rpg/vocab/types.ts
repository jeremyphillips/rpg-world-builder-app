import { midSentenceLabel, withArticle } from '../../validation/messages'

/** A value within a taxonomy — label, description, and optional prose forms. */
export type GameTermEntry = {
  readonly label: string
  readonly description: string
  /** Compact-surface display label; falls back to `label` when absent. */
  readonly compactLabel?: string
  /** Counted noun phrase forms for generated sentences, not replacement labels. */
  readonly sentence?: {
    readonly singular?: string
    readonly plural?: string
  }
}

/**
 * The taxonomy concept itself (`*_TERM`). Same shape as `GameTermEntry` today;
 * kept distinct so taxonomy-level metadata can diverge from option entries later.
 */
export type VocabularyTerm = GameTermEntry

export type VocabularyTermLabelNumber = 'singular' | 'plural'
export type VocabularyTermLabelCasing = 'sentence' | 'title'

export type VocabularyTermLabelOptions = {
  number?: VocabularyTermLabelNumber
  casing?: VocabularyTermLabelCasing
}

/** Title-case navigation label for a taxonomy concept (`term.label`). */
export function getVocabularyTermLabel(term: VocabularyTerm): string {
  return term.label
}

/**
 * Grammatical label from a taxonomy concept — not surface-specific.
 * Title + singular → `term.label`. All other combinations use curated `sentence` forms.
 */
export function vocabularyTermLabel(
  term: VocabularyTerm,
  options: VocabularyTermLabelOptions = {},
): string {
  const number = options.number ?? 'singular'
  const casing = options.casing ?? 'title'

  if (casing === 'title' && number === 'singular') {
    return term.label
  }

  return getTermSentenceForm(term, number === 'singular' ? 1 : 2)
}

export type VocabularyTermFieldCopyOptions = {
  multiple?: boolean
}

/** Default form field label and combobox placeholder from a taxonomy term. */
export function vocabularyTermFieldCopy(
  term: VocabularyTerm,
  options: VocabularyTermFieldCopyOptions = {},
): { label: string; placeholder: string } {
  const phrase = vocabularyTermLabel(term, {
    number: options.multiple ? 'plural' : 'singular',
    casing: 'sentence',
  })
  const label = phrase.charAt(0).toUpperCase() + phrase.slice(1)

  return {
    label,
    placeholder: options.multiple
      ? `Choose ${midSentenceLabel(phrase)}…`
      : `Choose ${withArticle(midSentenceLabel(phrase))}…`,
  }
}

/** Lowercase display label for simple generated prose. */
export function getTermLabelSingular(label: string): string {
  return label.toLowerCase()
}

/** Simple plural derivation for vocab labels; explicit sentence overrides handle exceptions. */
export function pluralizeTermLabel(label: string): string {
  const singular = getTermLabelSingular(label)
  return singular.endsWith('s') ? singular : `${singular}s`
}

/** Counted noun phrase form for generated prose. */
export function getTermSentenceForm(entry: GameTermEntry, count: number): string {
  const singular = entry.sentence?.singular ?? getTermLabelSingular(entry.label)
  if (count === 1) return singular
  return entry.sentence?.plural ?? (singular.endsWith('s') ? singular : `${singular}s`)
}

/** Compact-surface display label; falls back to `label` when `compactLabel` is absent. */
export function getTermCompactLabel(entry: GameTermEntry): string {
  return entry.compactLabel ?? entry.label
}
