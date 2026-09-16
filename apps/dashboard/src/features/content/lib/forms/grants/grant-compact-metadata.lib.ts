export type FormatCompactMetadataListOptions = {
  maxVisible?: number
}

/** Compact comma metadata for muted detail slots — never uses "and". */
export function formatCompactMetadataList(
  labels: readonly string[],
  options?: FormatCompactMetadataListOptions,
): string | undefined {
  const maxVisible = options?.maxVisible ?? 2
  const filtered = labels.filter((label) => label.length > 0)
  if (filtered.length === 0) return undefined
  if (filtered.length === 1) return filtered[0]
  if (filtered.length === 2) return `${filtered[0]}, ${filtered[1]}`
  if (filtered.length <= maxVisible) {
    return filtered.slice(0, maxVisible).join(', ')
  }
  const visible = filtered.slice(0, maxVisible).join(', ')
  return `${visible} +${filtered.length - maxVisible}`
}

/** Sentence-case multi-word category labels (e.g. "Gaming Set" → "Gaming set"). */
export function toSentenceCaseCategoryLabel(label: string): string {
  if (!label.includes(' ')) return label
  const [first, ...rest] = label.split(' ')
  return `${first} ${rest.join(' ').toLowerCase()}`
}
