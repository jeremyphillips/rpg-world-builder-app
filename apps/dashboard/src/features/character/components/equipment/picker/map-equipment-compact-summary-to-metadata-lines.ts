import type { EquipmentCompactSummary } from '@rpg/contracts'

import type { CatalogMetadataLine } from '@/features/content'

export function mapEquipmentCompactSummaryToMetadataLines(
  summary: EquipmentCompactSummary,
): CatalogMetadataLine[] {
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
