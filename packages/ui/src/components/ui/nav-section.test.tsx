/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { NavSection } from './nav-section'

describe('NavSection', () => {
  it('renders a labeled grouping for child links', () => {
    render(
      <NavSection label="Workspace">
        <a href="/characters">Characters</a>
      </NavSection>,
    )

    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Characters' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <NavSection label="Workspace">
        <a href="/characters">Characters</a>
      </NavSection>,
    )

    await expectNoAxeViolations(container)
  })
})
