import { describe, expect, it } from 'vitest'

import { characterBuilderAbilityRecommendationMessages, formatFieldMessage } from '@rpg/contracts'

import { buildAbilityRecommendationPanelModel } from './ability-recommendation-panel.lib'

const fighterClassInput = {
  className: 'Fighter',
  primaryAbilities: ['str', 'dex'] as const,
}

const fighterRecommendation = {
  primary: ['str'] as const,
  secondary: ['dex'] as const,
  suggestedAssignment: { str: 15, dex: 14 },
}

describe('buildAbilityRecommendationPanelModel', () => {
  it('shows Apply when the suggestion is not yet satisfied', () => {
    const model = buildAbilityRecommendationPanelModel({
      classInput: fighterClassInput,
      recommendation: fighterRecommendation,
      currentScores: {},
      showSuggestedAssignment: true,
      canApplySuggestions: true,
    })

    expect(model.showAction).toBe(true)
    expect(model.showAppliedState).toBe(false)
    expect(model.actionLabel).toBe(
      formatFieldMessage(characterBuilderAbilityRecommendationMessages.apply()),
    )
  })

  it('shows Applied when current scores match the suggestion exactly', () => {
    const model = buildAbilityRecommendationPanelModel({
      classInput: fighterClassInput,
      recommendation: fighterRecommendation,
      currentScores: { str: 15, dex: 14 },
      showSuggestedAssignment: true,
      canApplySuggestions: true,
    })

    expect(model.showAction).toBe(false)
    expect(model.showAppliedState).toBe(true)
  })

  it('shows Replace when applying would overwrite existing assignments', () => {
    const model = buildAbilityRecommendationPanelModel({
      classInput: fighterClassInput,
      recommendation: fighterRecommendation,
      currentScores: { cha: 15 },
      showSuggestedAssignment: true,
      canApplySuggestions: true,
    })

    expect(model.showAction).toBe(true)
    expect(model.actionLabel).toBe(
      formatFieldMessage(characterBuilderAbilityRecommendationMessages.replace()),
    )
  })
})
