export const SUGGESTED_BY_PREFIX = 'Suggested by' as const

/** Shared "Suggested by …" sentence. Callers choose whether the current UI keeps a trailing period. */
export function formatSuggestedBySentence(
  sourceLabel: string,
  options?: { trailingPeriod?: boolean },
): string {
  const sentence = `${SUGGESTED_BY_PREFIX} ${sourceLabel}`
  return options?.trailingPeriod ? `${sentence}.` : sentence
}

/** Shared "{source} suggests {display}." sentence used when the current value differs. */
export function formatSourceSuggestsSentence(sourceLabel: string, display: string): string {
  return `${sourceLabel} suggests ${display}.`
}
