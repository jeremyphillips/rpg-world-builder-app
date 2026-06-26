import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'

import { HomebrewHubCard } from './homebrew-hub-card'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('HomebrewHubCard', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <HomebrewHubCard
          title="Classes"
          description="12 items available"
          viewHref="/campaigns/camp_1/classes"
          createHref="/campaigns/camp_1/classes/new"
          showCreate
        />
      </MemoryRouter>,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument()
  })
})
