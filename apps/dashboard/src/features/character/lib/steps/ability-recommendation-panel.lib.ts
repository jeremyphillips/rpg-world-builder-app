import {
  characterBuilderAbilityRecommendationMessages,
  formatAbilityRecommendationBenefit,
  formatAbilityRecommendationSuggestedInline,
  formatFieldMessage,
  getAbilityLabel,
  resolveSuggestedAssignmentActionState,
  type Ability,
  type AbilityScoreRecommendation,
  type AbilityScoreRecommendationClassInput,
  type SuggestedAssignmentActionState,
} from '@rpg/contracts'

export type AbilityRecommendationPanelModel = {
  heading: string
  benefitText: string
  suggestedText?: string
  actionLabel: string
  appliedLabel: string
  showAction: boolean
  showAppliedState: boolean
  suggestedAssignment?: Partial<Record<Ability, number>>
}

export function suggestedAssignmentPairLabels(
  classInput: AbilityScoreRecommendationClassInput,
  assignment: Partial<Record<Ability, number>>,
): string[] {
  return classInput.primaryAbilities.flatMap((ability) => {
    const score = assignment[ability]
    if (typeof score !== 'number') return []
    return [
      formatFieldMessage(
        characterBuilderAbilityRecommendationMessages.suggestedRow({
          score,
          abilityLabel: getAbilityLabel(ability),
        }),
      ),
    ]
  })
}

function formatRecommendationHeading(className: string): string {
  return formatFieldMessage(characterBuilderAbilityRecommendationMessages.heading({ className }))
}

function formatRecommendationBenefit(classInput: AbilityScoreRecommendationClassInput): string {
  return formatFieldMessage(
    formatAbilityRecommendationBenefit({
      className: classInput.className,
      primaryAbilities: classInput.primaryAbilities,
    }),
  )
}

function formatSuggestedAssignmentText(pairLabels: readonly string[]): string | undefined {
  if (pairLabels.length === 0) return undefined
  return formatFieldMessage(formatAbilityRecommendationSuggestedInline(pairLabels) ?? '')
}

function formatActionLabel(actionState: SuggestedAssignmentActionState | undefined): string {
  if (actionState === 'wouldReplace') {
    return formatFieldMessage(characterBuilderAbilityRecommendationMessages.replace())
  }
  return formatFieldMessage(characterBuilderAbilityRecommendationMessages.apply())
}

function resolvePanelActionVisibility(args: {
  showSuggestedAssignment: boolean
  canApplySuggestions: boolean
  hasSuggestedPairs: boolean
  actionState: SuggestedAssignmentActionState | undefined
}): Pick<AbilityRecommendationPanelModel, 'showAction' | 'showAppliedState'> {
  const { showSuggestedAssignment, canApplySuggestions, hasSuggestedPairs, actionState } = args

  if (!showSuggestedAssignment || !hasSuggestedPairs || actionState === undefined) {
    return { showAction: false, showAppliedState: false }
  }

  return {
    showAction: canApplySuggestions && actionState !== 'satisfied',
    showAppliedState: actionState === 'satisfied',
  }
}

export function buildAbilityRecommendationPanelModel(args: {
  classInput: AbilityScoreRecommendationClassInput
  recommendation: AbilityScoreRecommendation | null
  currentScores: Partial<Record<Ability, number>>
  showSuggestedAssignment: boolean
  canApplySuggestions: boolean
}): AbilityRecommendationPanelModel {
  const {
    classInput,
    recommendation,
    currentScores,
    showSuggestedAssignment,
    canApplySuggestions,
  } = args

  const suggestedAssignment = recommendation?.suggestedAssignment
  const suggestedPairLabels =
    suggestedAssignment && showSuggestedAssignment
      ? suggestedAssignmentPairLabels(classInput, suggestedAssignment)
      : []

  const hasSuggestedPairs = suggestedPairLabels.length > 0
  const actionState =
    suggestedAssignment && hasSuggestedPairs
      ? resolveSuggestedAssignmentActionState(currentScores, suggestedAssignment)
      : undefined

  const visibility = resolvePanelActionVisibility({
    showSuggestedAssignment,
    canApplySuggestions,
    hasSuggestedPairs,
    actionState,
  })

  return {
    heading: formatRecommendationHeading(classInput.className),
    benefitText: formatRecommendationBenefit(classInput),
    suggestedText: formatSuggestedAssignmentText(suggestedPairLabels),
    actionLabel: formatActionLabel(actionState),
    appliedLabel: formatFieldMessage(characterBuilderAbilityRecommendationMessages.applied()),
    ...visibility,
    suggestedAssignment: showSuggestedAssignment ? suggestedAssignment : undefined,
  }
}
