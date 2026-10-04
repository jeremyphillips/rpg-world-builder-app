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

  it('lists the full standard-array order, not only primary abilities', () => {
    const model = buildAbilityRecommendationPanelModel({
      classInput: {
        className: 'Fighter',
        primaryAbilities: ['str', 'dex'],
        abilityScoreOrder: ['str', 'dex', 'con', 'cha', 'wis', 'int'],
      },
      recommendation: {
        primary: ['str'],
        secondary: ['dex'],
        suggestedAssignment: {
          str: 15,
          dex: 14,
          con: 13,
          cha: 12,
          wis: 10,
          int: 8,
        },
      },
      currentScores: {},
      showSuggestedAssignment: true,
      canApplySuggestions: true,
    })

    expect(model.suggestedText).toContain('15')
    expect(model.suggestedText).toContain('Constitution')
    expect(model.suggestedText).toContain('Intelligence')
    expect(model.suggestedText?.indexOf('Strength')).toBeLessThan(
      model.suggestedText?.indexOf('Constitution') ?? -1,
    )
    expect(model.suggestedText?.indexOf('Constitution')).toBeLessThan(
      model.suggestedText?.indexOf('Charisma') ?? -1,
    )
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
