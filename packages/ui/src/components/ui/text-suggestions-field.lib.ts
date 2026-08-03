/** Filters suggestion strings by a case-insensitive substring match. */
export function filterTextSuggestions(
  suggestions: readonly string[],
  query: string,
): readonly string[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return suggestions
  return suggestions.filter((suggestion) => suggestion.includes(normalized))
}

/** Title-cases a normalized suggestion for display (e.g. `coaching inn` → `Coaching inn`). */
export function formatTextSuggestionLabel(suggestion: string): string {
  const trimmed = suggestion.trim()
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
