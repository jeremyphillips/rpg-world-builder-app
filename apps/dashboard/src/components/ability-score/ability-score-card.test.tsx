import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AbilityScoreCard } from './ability-score-card'
import { AbilityScoreRecommendationIndicator } from './ability-score-recommendation-indicator'

describe('AbilityScoreCard', () => {
  it('shows an em dash modifier when the score is null', () => {
    render(<AbilityScoreCard ability="str" value={null} />)
    expect(screen.getByText('—', { selector: 'p' })).toBeInTheDocument()
  })

  it('keeps the abbreviation centered when a recommendation star is present', () => {
    render(
      <AbilityScoreCard
        ability="str"
        value={15}
        headerAdornment={
          <AbilityScoreRecommendationIndicator label="Recommended primary ability for Fighter." />
        }
      />,
    )
    expect(screen.getByText('STR')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Recommended primary ability for Fighter.' }),
    ).toBeInTheDocument()
  })
})
