/**
 * Middle-dot metadata joining for compact inline labels (e.g. `Weapon · 1d6`).
 * Typography and layout belong in `@rpg/ui` `InlineMetadata`; this module owns spacing only.
 */

export const INLINE_METADATA_SEPARATOR = '·'

export type InlineMetadataPart = string | number | null | undefined | false

const JOINED_SEPARATOR = ` ${INLINE_METADATA_SEPARATOR} `

function isKeptInlineMetadataPart(part: InlineMetadataPart): part is string | number {
  if (part === null || part === undefined || part === false) return false
  if (typeof part === 'number') return !Number.isNaN(part)
  return part.trim().length > 0
}

/** Drops null/undefined/false and blank strings; keeps every number (including 0); trims; joins with ` · `. */
export function joinInlineMetadata(parts: readonly InlineMetadataPart[]): string {
  const kept: string[] = []
  for (const part of parts) {
    if (!isKeptInlineMetadataPart(part)) continue
    kept.push(typeof part === 'string' ? part.trim() : String(part))
  }
  if (kept.length === 0) return ''
  return kept.join(JOINED_SEPARATOR)
}
