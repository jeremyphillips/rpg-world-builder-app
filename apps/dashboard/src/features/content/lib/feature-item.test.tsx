import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FeatureItem } from './feature-item'

describe('FeatureItem', () => {
  it('renders composed feature HTML with level heading', () => {
    render(
      <FeatureItem
        feature={{
          level: 3,
          name: 'Bonus Proficiencies',
          description: '<p>You gain proficiency with three skills of your choice.</p>',
        }}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Level 3: Bonus Proficiencies' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/three skills of your choice/)).toBeInTheDocument()
  })
})
