import type { SkillProficiencyCompactSummary } from '@rpg/contracts'

import type { CatalogMetadataLine } from '@/features/content'

export function mapSkillProficiencyCompactSummaryToMetadataLines(
  summary: SkillProficiencyCompactSummary,
): CatalogMetadataLine[] {
  return [
    {
      segments: [{ type: 'text', text: summary.abilityLabel }],
    },
  ]
}
