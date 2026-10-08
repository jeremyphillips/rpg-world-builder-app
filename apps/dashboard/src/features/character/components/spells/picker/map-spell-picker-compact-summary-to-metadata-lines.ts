import type { SpellPickerCompactSummary, SpellPickerMetadataGroup } from '@rpg/contracts'

import type { CatalogMetadataLine, CatalogMetadataSegment } from '@/features/content'

function mapSpellPickerMetadataGroup(group: SpellPickerMetadataGroup): CatalogMetadataSegment {
  if (group.kind === 'classification') {
    return {
      type: 'text',
      text: `${group.levelLabel} ${group.schoolLabel}`,
      parts: [
        { text: group.levelLabel, emphasis: 'strong' },
        { text: group.schoolLabel, emphasis: 'default' },
      ],
    }
  }

  return { type: 'text', text: group.label }
}

export function mapSpellPickerCompactSummaryToMetadataLines(
  summary: SpellPickerCompactSummary,
): CatalogMetadataLine[] {
  if (summary.groups.length === 0) return []

  return [
    {
      segments: summary.groups.map((group) => mapSpellPickerMetadataGroup(group)),
    },
  ]
}
