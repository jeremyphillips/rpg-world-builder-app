import type { CatalogMetadataLine, CatalogMetadataSegment } from './catalog-metadata.types'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

function catalogMetadataSegmentPlainText(segment: CatalogMetadataSegment): string {
  if (segment.type === 'text' && segment.parts && segment.parts.length > 0) {
    return segment.parts
      .map((part) => part.text.trim())
      .filter((text) => text.length > 0)
      .join(' ')
  }

  return segment.text
}

/** Plain-text summary for compact list-result metadata and combobox rows. */
export function formatCatalogMetadataLines(lines: readonly CatalogMetadataLine[]): string {
  return joinInlineMetadata(
    lines
      .map((line) =>
        joinInlineMetadata(
          line.segments.map((segment) => catalogMetadataSegmentPlainText(segment)),
        ),
      )
      .filter((line) => line.length > 0),
  )
}
