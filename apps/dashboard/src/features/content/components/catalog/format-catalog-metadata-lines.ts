import type { CatalogMetadataLine } from './catalog-metadata.types'

/** Plain-text summary for compact preview surfaces (PreviewCard description, combobox rows). */
export function formatCatalogMetadataLines(lines: readonly CatalogMetadataLine[]): string {
  return lines
    .map((line) => line.segments.map((segment) => segment.text).join(' · '))
    .filter((line) => line.length > 0)
    .join(' · ')
}
