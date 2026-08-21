import type { SpellPickerCompactSummary } from '@rpg/contracts'

import type { CatalogPickerMetadataLine } from '../catalog-picker-metadata.types'

export function mapSpellPickerCompactSummaryToMetadataLines(
  summary: SpellPickerCompactSummary,
): CatalogPickerMetadataLine[] {
  return [
    {
      segments: summary.castingSummary.map((text) => ({
        type: 'text' as const,
        text,
      })),
    },
    {
      segments: [
        {
          type: 'text' as const,
          text: summary.classification.levelLabel,
        },
        ...summary.classification.descriptors.map((text) => ({
          type: 'text' as const,
          text,
        })),
      ],
    },
  ]
}
