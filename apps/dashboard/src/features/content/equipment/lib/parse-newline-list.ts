/** Parses newline-separated form text into a trimmed string list, or `undefined` when empty. */
export function parseNewlineList(text: string | undefined): string[] | undefined {
  if (!text?.trim()) return undefined
  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}
