import type { FieldRecommendation } from '@rpg/ui'

import { resolveSingleFieldRecommendation } from '@/lib/forms/recommendations/resolve-single-field-recommendation.lib'

export const MONSTER_LANGUAGE_RECOMMENDATION_ADD_LABEL = '+ Add'

export function buildMonsterLanguageFieldRecommendation(input: {
  affinityLanguageIds: readonly string[]
  selectableLanguageIds: readonly string[]
  selectedLanguageIds: readonly string[]
  languageLabelById: Readonly<Record<string, string>>
  creatureTypeLabel?: string
  onAddLanguage: (languageId: string) => void
}): FieldRecommendation | null {
  const recommendedId = resolveSingleFieldRecommendation({
    recommendedIds: input.affinityLanguageIds,
    selectedIds: input.selectedLanguageIds,
    availableIds: input.selectableLanguageIds,
  })
  if (!recommendedId || !input.creatureTypeLabel) return null

  const languageLabel = input.languageLabelById[recommendedId] ?? recommendedId

  return {
    content: (
      <>
        Recommended for this creature type:{' '}
        <span className="font-body-emphasis">{input.creatureTypeLabel}</span>
      </>
    ),
    action: {
      label: MONSTER_LANGUAGE_RECOMMENDATION_ADD_LABEL,
      ariaLabel: `Add ${languageLabel}`,
      onClick: () => input.onAddLanguage(recommendedId),
    },
  }
}
