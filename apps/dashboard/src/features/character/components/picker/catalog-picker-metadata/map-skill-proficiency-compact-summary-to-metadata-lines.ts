import type { SkillProficiencyCompactSummary } from '@rpg/contracts'

import type { CatalogPickerMetadataLine } from './catalog-picker-metadata.types'

export function mapSkillProficiencyCompactSummaryToMetadataLines(
  summary: SkillProficiencyCompactSummary,
): CatalogPickerMetadataLine[] {
  return [
    {
      segments: [{ type: 'text', text: summary.abilityLabel }],
    },
  ]
}
