import { defineMessage } from '../../../../validation/define-message'

// ---------------------------------------------------------------------------
// Ability score recommendation messages — advisory copy for the Abilities step.
// Distinct from validation messages; recommendations never block Continue.
// See docs/validation-messages.md.
// ---------------------------------------------------------------------------

export const characterBuilderAbilityRecommendationMessages = {
  noClass: defineMessage(
    'validation.characterBuilder.abilityRecommendation.noClass',
    () => 'Choose a class to see ability score recommendations.',
  ),
  heading: defineMessage<{ className: string }>(
    'validation.characterBuilder.abilityRecommendation.heading',
    ({ className }) => `Recommended for ${className}`,
  ),
  benefit: defineMessage<{ classNamePlural: string; abilitiesOrList: string; verb: 'is' | 'are' }>(
    'validation.characterBuilder.abilityRecommendation.benefit',
    ({ classNamePlural, abilitiesOrList, verb }) =>
      `${abilitiesOrList} ${verb} useful for ${classNamePlural}.`,
  ),
  suggestedInline: defineMessage<{ pairs: string }>(
    'validation.characterBuilder.abilityRecommendation.suggestedInline',
    ({ pairs }) => `Suggested: ${pairs}.`,
  ),
  suggestedRow: defineMessage<{ score: number; abilityLabel: string }>(
    'validation.characterBuilder.abilityRecommendation.suggestedRow',
    ({ score, abilityLabel }) => `${score} → ${abilityLabel}`,
  ),
  apply: defineMessage(
    'validation.characterBuilder.abilityRecommendation.apply',
    () => 'Apply suggestions',
  ),
  replace: defineMessage(
    'validation.characterBuilder.abilityRecommendation.replace',
    () => 'Replace with suggestions',
  ),
  applied: defineMessage(
    'validation.characterBuilder.abilityRecommendation.applied',
    () => 'Applied',
  ),
  badgePrimary: defineMessage(
    'validation.characterBuilder.abilityRecommendation.badgePrimary',
    () => 'Recommended',
  ),
  badgeSecondary: defineMessage(
    'validation.characterBuilder.abilityRecommendation.badgeSecondary',
    () => 'Also useful',
  ),
  autoFillRemaining: defineMessage(
    'validation.characterBuilder.abilityRecommendation.autoFillRemaining',
    () => 'Auto-fill remaining',
  ),
  clearScores: defineMessage(
    'validation.characterBuilder.abilityRecommendation.clearScores',
    () => 'Clear scores',
  ),
}
