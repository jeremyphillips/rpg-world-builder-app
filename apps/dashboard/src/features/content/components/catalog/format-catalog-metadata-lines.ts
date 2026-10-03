import type { CatalogMetadataLine } from './catalog-metadata.types'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

/** Plain-text summary for compact list-result metadata and combobox rows. */
export function formatCatalogMetadataLines(lines: readonly CatalogMetadataLine[]): string {
  return joinInlineMetadata(
    lines
      .map((line) => joinInlineMetadata(line.segments.map((segment) => segment.text)))
      .filter((line) => line.length > 0),
  )
}
