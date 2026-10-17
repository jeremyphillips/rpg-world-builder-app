/** Supporting-line segments for entity surfaces — rendered in anatomy, not in projectors. */
export type EntitySurfaceMetadataLine = readonly string[]

const INLINE_METADATA_SEGMENT_SEPARATOR = /\s·\s/

/** Returns normalized segments when at least one non-empty label remains. */
export function entitySurfaceMetadataLine(
  segments: readonly string[],
): EntitySurfaceMetadataLine | undefined {
  const normalized = segments
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
  return normalized.length > 0 ? normalized : undefined
}

/** Single-segment line from plain copy (status reasons, located-in text, overrides). */
export function entitySurfaceMetadataFromText(
  text: string | undefined,
): EntitySurfaceMetadataLine | undefined {
  if (text == null) return undefined
  const trimmed = text.trim()
  return trimmed.length > 0 ? [trimmed] : undefined
}

/** Splits transport/joined inline summaries back into segment lines. */
export function entitySurfaceMetadataFromJoinedCopy(
  text: string | undefined,
): EntitySurfaceMetadataLine | undefined {
  if (text == null) return undefined
  const trimmed = text.trim()
  if (trimmed.length === 0) return undefined
  return entitySurfaceMetadataLine(trimmed.split(INLINE_METADATA_SEGMENT_SEPARATOR))
}
