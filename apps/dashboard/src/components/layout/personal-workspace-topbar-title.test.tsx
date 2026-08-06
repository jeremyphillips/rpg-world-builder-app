import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'

import {
  PERSONAL_WORKSPACE_TOPBAR_LABEL,
  personalWorkspaceTopbarTitleClasses,
} from './personal-workspace-topbar-title.variants'
import { PersonalWorkspaceTopbarTitle } from './personal-workspace-topbar-title'

describe('PersonalWorkspaceTopbarTitle', () => {
  it('renders a linked personal workspace title with subtle foreground styling', () => {
    render(
      <MemoryRouter>
        <PersonalWorkspaceTopbarTitle />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: PERSONAL_WORKSPACE_TOPBAR_LABEL })
    expect(link).toHaveAttribute('href', ROUTES.home)
    expect(link).toHaveClass('text-foreground-subtle', 'hover:text-foreground')
    expect(link.querySelector('[aria-hidden="true"]')).toHaveClass('text-foreground-subtle')
    expect(
      link.querySelector(`.${personalWorkspaceTopbarTitleClasses.label.split(' ')[0]}`),
    ).toBeTruthy()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <PersonalWorkspaceTopbarTitle />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
