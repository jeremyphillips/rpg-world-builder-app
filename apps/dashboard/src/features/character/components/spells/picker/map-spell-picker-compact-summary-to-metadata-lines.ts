import type { SpellPickerCompactSummary } from '@rpg/contracts'

import type { CatalogMetadataLine } from '@/features/content'

export function mapSpellPickerCompactSummaryToMetadataLines(
  summary: SpellPickerCompactSummary,
): CatalogMetadataLine[] {
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
