import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { LANDING_FEATURES } from './landing-content'
import { LandingFeatures } from './landing-features'

describe('LandingFeatures', () => {
  it('renders a card for every feature', () => {
    render(<LandingFeatures />)

    for (const feature of LANDING_FEATURES) {
      expect(screen.getByRole('heading', { level: 3, name: feature.title })).toBeInTheDocument()
    }
  })

  it('labels the section with its heading', () => {
    render(<LandingFeatures />)

    expect(
      screen.getByRole('region', { name: /tools for every part of your table/i }),
    ).toBeInTheDocument()
  })
})
