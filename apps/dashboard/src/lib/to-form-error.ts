/**
 * Derives a human-readable string from a mutation error for display in a
 * form's `formError` prop. Returns `undefined` when there is no error.
 *
 * An `Error` instance surfaces its own message; any other truthy value
 * (e.g. an unknown thrown object) falls back to the supplied fallback string.
 */
export function toFormError(error: unknown, fallback: string): string | undefined {
  if (!error) return undefined
  return error instanceof Error ? error.message : fallback
}
