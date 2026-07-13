import type { SpellPickerCompactSummary } from '@rpg/contracts'

import type { CatalogPickerMetadataLine } from './catalog-picker-metadata.types'

const SPELL_PICKER_LEVEL_BADGE = {
  tone: 'neutral',
  appearance: 'neutral',
} as const

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
          type: 'badge' as const,
          text: summary.classification.levelLabel,
          ...SPELL_PICKER_LEVEL_BADGE,
        },
        ...summary.classification.descriptors.map((text) => ({
          type: 'text' as const,
          text,
        })),
      ],
    },
  ]
}
