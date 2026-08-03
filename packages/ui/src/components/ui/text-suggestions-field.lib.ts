/** Title-cases a normalized suggestion for display (e.g. `coaching inn` → `Coaching inn`). */
export function formatTextSuggestionLabel(suggestion: string): string {
  const trimmed = suggestion.trim()
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
