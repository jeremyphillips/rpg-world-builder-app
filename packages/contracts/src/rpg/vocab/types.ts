import { resolveChoicePlaceholder, type FieldNoun } from '../../form-copy/messages'

/** A value within a taxonomy — label, description, and optional prose forms. */
export type GameTermEntry = {
  readonly label: string
  readonly description: string
  /** Compact-surface display label; falls back to `label` when absent. */
  readonly compactLabel?: string
  /** Category or set name in UI (sentence case); not a substitute for `compactLabel`. */
  readonly collectionLabel?: string
  /** Counted noun phrase forms for generated sentences, not replacement labels. */
  readonly sentence?: {
    readonly singular?: string
    readonly plural?: string
  }
}

/**
 * Presentation/order precedence for vocabulary entries and roster rows.
 * Higher sorts first. Does not convey authority or permission semantics.
 */
export type PrioritizedEntry = {
  readonly priority: number
}

/** Descending priority comparator — higher priority sorts first. */
export function comparePriorityDescending(a: PrioritizedEntry, b: PrioritizedEntry): number {
  return b.priority - a.priority
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
const TITLE_CASE_MINOR_WORDS = new Set([
  'a',
  'an',
  'and',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
])

/** Title-case presentation for hub and navigation copy (derived, not stored on terms). */
export function titleCaseLabel(phrase: string): string {
  const words = phrase.trim().split(/\s+/).filter(Boolean)
  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && TITLE_CASE_MINOR_WORDS.has(lower)) {
        return lower
      }
      return capitalizeFirst(lower)
    })
    .join(' ')
}

export function vocabularyTermLabel(
  term: VocabularyTerm,
  options: VocabularyTermLabelOptions = {},
): string {
  const number = options.number ?? 'singular'
  const casing = options.casing ?? 'title'

  if (casing === 'title' && number === 'singular') {
    return term.label
  }

  const sentenceForm = getTermSentenceForm(term, number === 'singular' ? 1 : 2)
  if (casing === 'title' && number === 'plural') {
    return titleCaseLabel(sentenceForm)
  }

  return sentenceForm
}

export type VocabularyTermFieldCopyOptions = {
  multiple?: boolean
}

/** Noun metadata from a taxonomy term's curated sentence forms. */
export function nounFromTerm(term: VocabularyTerm): FieldNoun {
  return {
    singular: getTermSentenceForm(term, 1),
    plural: getTermSentenceForm(term, 2),
  }
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
  const label = capitalizeFirst(phrase)

  return {
    label,
    placeholder: resolveChoicePlaceholder(nounFromTerm(term), options.multiple === true),
  }
}

/** Sentence-case first character for derived collection copy. */
export function capitalizeFirst(value: string): string {
  if (value.length === 0) return value
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

/** Lowercase display label for simple generated prose. */
export function getTermLabelSingular(label: string): string {
  return label.toLowerCase()
}

/** Entry maps that participate in counted noun phrases must declare sentence forms. */
export type CountableTermEntry = GameTermEntry & {
  readonly sentence: {
    readonly singular: string
    readonly plural: string
  }
}

/** Strict counted phrase — no heuristic plural fallback. */
export function formatTermCount(entry: CountableTermEntry, count: number): string {
  const noun = count === 1 ? entry.sentence.singular : entry.sentence.plural
  return `${count} ${noun}`
}

/** Strict counted accessor for curated entry maps. */
export function getCountedTermForm(entry: CountableTermEntry, count: number): string {
  return count === 1 ? entry.sentence.singular : entry.sentence.plural
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

/** Collection or set display label; falls back to capitalized plural sentence form. */
export function getTermCollectionLabel(entry: GameTermEntry): string {
  if (entry.collectionLabel) return entry.collectionLabel
  return capitalizeFirst(getTermSentenceForm(entry, 2))
}
