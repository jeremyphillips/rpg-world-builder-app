import type { EquipmentCompactSummary } from '@rpg/contracts'

import type { CatalogPickerMetadataLine } from '../catalog-picker-metadata.types'

export function mapEquipmentCompactSummaryToMetadataLines(
  summary: EquipmentCompactSummary,
): CatalogPickerMetadataLine[] {
  if (summary.comparisonGroups.length === 0) return []

  return [
    {
      segments: summary.comparisonGroups.map((group) => ({
        type: 'text' as const,
        text: group,
      })),
    },
  ]
}
