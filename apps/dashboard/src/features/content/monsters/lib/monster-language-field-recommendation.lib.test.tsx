import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  buildMonsterLanguageFieldRecommendation,
  MONSTER_LANGUAGE_RECOMMENDATION_ADD_LABEL,
} from './monster-language-field-recommendation.lib'

describe('buildMonsterLanguageFieldRecommendation', () => {
  it('builds copy when a single affinity is selectable and none are selected', () => {
    const onAddLanguage = vi.fn()
    const recommendation = buildMonsterLanguageFieldRecommendation({
      affinityLanguageIds: ['draconic'],
      selectableLanguageIds: ['draconic', 'common'],
      selectedLanguageIds: [],
      languageLabelById: { draconic: 'Draconic' },
      creatureTypeLabel: 'Dragon',
      onAddLanguage,
    })

    expect(recommendation).not.toBeNull()
    render(<>{recommendation?.content}</>)
    expect(screen.getByText('Draconic')).toBeInTheDocument()
    expect(screen.getByText(/Dragon creature type/)).toBeInTheDocument()
    expect(recommendation?.action.label).toBe(MONSTER_LANGUAGE_RECOMMENDATION_ADD_LABEL)
    recommendation?.action.onClick()
    expect(onAddLanguage).toHaveBeenCalledWith('draconic')
  })

  it('returns null when multiple affinities are configured', () => {
    expect(
      buildMonsterLanguageFieldRecommendation({
        affinityLanguageIds: ['draconic', 'infernal'],
        selectableLanguageIds: ['draconic', 'infernal'],
        selectedLanguageIds: [],
        languageLabelById: {},
        creatureTypeLabel: 'Dragon',
        onAddLanguage: vi.fn(),
      }),
    ).toBeNull()
  })

  it('returns null when the affinity is not in selectable options', () => {
    expect(
      buildMonsterLanguageFieldRecommendation({
        affinityLanguageIds: ['draconic'],
        selectableLanguageIds: ['common'],
        selectedLanguageIds: [],
        languageLabelById: { draconic: 'Draconic' },
        creatureTypeLabel: 'Dragon',
        onAddLanguage: vi.fn(),
      }),
    ).toBeNull()
  })
})
