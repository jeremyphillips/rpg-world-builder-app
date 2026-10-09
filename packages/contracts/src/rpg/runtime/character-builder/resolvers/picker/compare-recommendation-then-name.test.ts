import { describe, expect, it } from 'vitest'

import {
  NEUTRAL_OPTION_RECOMMENDATION,
  RECOMMENDATION_STRENGTHS,
  type OptionRecommendation,
  type RecommendationStrength,
} from '../../recommendation'
import { compareRecommendationThenName } from './compare-recommendation-then-name'

function recommendation(strength: RecommendationStrength): OptionRecommendation {
  if (strength === 'neutral') return NEUTRAL_OPTION_RECOMMENDATION
  return {
    strength,
    signals: [
      {
        strength,
        basis: 'inferred',
        specificity: 'exact',
      },
    ],
  }
}

describe('compareRecommendationThenName', () => {
  it('orders strong, compatible, neutral, then discouraged, and breaks ties by name', () => {
    const rows = [
      { name: 'Zulu', strength: 'neutral' as const },
      { name: 'Alpha', strength: 'discouraged' as const },
      { name: 'Mike', strength: 'compatible' as const },
      { name: 'Bravo', strength: 'strong' as const },
      { name: 'Alpha', strength: 'strong' as const },
      { name: 'Zulu', strength: 'compatible' as const },
    ]

    const ordered = [...rows].sort((left, right) =>
      compareRecommendationThenName(
        recommendation(left.strength),
        recommendation(right.strength),
        left.name,
        right.name,
      ),
    )

    expect(ordered).toEqual([
      { name: 'Alpha', strength: 'strong' },
      { name: 'Bravo', strength: 'strong' },
      { name: 'Mike', strength: 'compatible' },
      { name: 'Zulu', strength: 'compatible' },
      { name: 'Zulu', strength: 'neutral' },
      { name: 'Alpha', strength: 'discouraged' },
    ])
    expect(RECOMMENDATION_STRENGTHS).toEqual(['strong', 'compatible', 'neutral', 'discouraged'])
  })
})
