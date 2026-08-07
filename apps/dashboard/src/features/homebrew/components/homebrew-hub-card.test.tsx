import { describe, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { HomebrewHubCard } from './homebrew-hub-card'

describe('HomebrewHubCard', () => {
  itAxe('has no axe violations', async () => {
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
    await expectNoAxeViolations(container)
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument()
  })
})
