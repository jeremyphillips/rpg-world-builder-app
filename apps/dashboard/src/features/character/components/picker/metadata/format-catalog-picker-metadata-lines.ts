import type { CatalogPickerMetadataLine } from './catalog-picker-metadata.types'

/** Plain-text summary for compact preview surfaces (PreviewCard description, combobox rows). */
export function formatCatalogPickerMetadataLines(
  lines: readonly CatalogPickerMetadataLine[],
): string {
  return lines
    .map((line) => line.segments.map((segment) => segment.text).join(' · '))
    .filter((line) => line.length > 0)
    .join(' · ')
}
