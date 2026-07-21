/** Shared shape for closed-set game terms (labels, SRD rule text, tooltips). */
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

/** The concept a closed `*_ENTRIES` map classifies (sibling `*_TERM` constant). */
export type VocabularyTerm = GameTermEntry

/** Title-case label for a vocabulary concept. */
export function getVocabularyTermLabel(term: VocabularyTerm): string {
  return term.label
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
