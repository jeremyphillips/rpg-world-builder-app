import type {
  Ability,
  AbilityScoreRecommendation,
  AbilityScoreRecommendationClassInput,
} from '@rpg/contracts'

export type AbilityRecommendationPanelProps = {
  classInput: AbilityScoreRecommendationClassInput | null
  classStepApplicable: boolean
  recommendation: AbilityScoreRecommendation | null
  currentScores: Partial<Record<Ability, number>>
  showSuggestedAssignment?: boolean
  onApplySuggestions?: (suggestedAssignment: Partial<Record<Ability, number>>) => void
}
