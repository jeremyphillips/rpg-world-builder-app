import type { FieldRecommendationGroup } from '@rpg/ui'

import type { WeaponProficiencyMissingRecommendation } from './prepare-weapon-proficiency-combobox-options.lib'

export function buildWeaponProficiencyRecommendationGroup(input: {
  candidates: readonly WeaponProficiencyMissingRecommendation[]
  sourceLabel: string
  addActionLabel: string
  formatBulkAddAriaLabel: (count: number) => string
  onAddGrant: (grantId: string) => void
  onAddAllGrants: (grantIds: readonly string[]) => void
}): FieldRecommendationGroup | null {
  if (input.candidates.length === 0) return null

  const grantIds = input.candidates.map((candidate) => candidate.grantId)

  return {
    sourceLabel: input.sourceLabel,
    items: input.candidates.map((candidate) => ({
      id: candidate.grantId,
      label: candidate.label,
      action: {
        label: input.addActionLabel,
        ariaLabel: `Add ${candidate.label}`,
        onClick: () => input.onAddGrant(candidate.grantId),
      },
    })),
    bulkAction: {
      label: 'Add all',
      ariaLabel: input.formatBulkAddAriaLabel(input.candidates.length),
      onClick: () => input.onAddAllGrants(grantIds),
    },
  }
}
