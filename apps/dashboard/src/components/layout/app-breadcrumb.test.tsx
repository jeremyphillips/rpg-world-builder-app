import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { AppBreadcrumb } from './app-breadcrumb'

describe('AppBreadcrumb', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders nothing when crumbs are empty', () => {
    const { container } = render(
      <MemoryRouter>
        <AppBreadcrumb crumbs={[]} />
      </MemoryRouter>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a terminal crumb without href as the current page', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb crumbs={[{ label: 'Profile' }]} />
      </MemoryRouter>,
    )

    const page = screen.getByText('Profile')
    expect(page).toBeInTheDocument()
    expect(page.tagName).not.toBe('A')
    expect(page).toHaveAttribute('aria-current', 'page')
  })

  it('renders a terminal crumb with href as a link', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb
          crumbs={[
            {
              label: 'Classes',
              href: '/campaigns/c1/classes',
            },
          ]}
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Classes' })
    expect(link).toHaveAttribute('href', '/campaigns/c1/classes')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('renders collection index crumbs without links and entity crumbs as current page', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb
          crumbs={[
            {
              label: 'Classes',
              href: '/campaigns/c1/classes',
            },
            { label: 'Wizard' },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Classes' })).toBeInTheDocument()
    const wizard = screen.getByText('Wizard')
    expect(wizard).toHaveAttribute('aria-current', 'page')
    expect(wizard.tagName).not.toBe('A')
  })

  it('renders entity edit crumbs with a terminal detail link', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb
          crumbs={[
            {
              label: 'Classes',
              href: '/campaigns/c1/classes',
            },
            {
              label: 'Wizard',
              href: '/campaigns/c1/classes/wizard',
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Wizard' })).toHaveAttribute(
      'href',
      '/campaigns/c1/classes/wizard',
    )
    expect(screen.getByRole('link', { name: 'Wizard' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('does not render a campaign segment in supplied crumbs', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb
          crumbs={[
            {
              label: 'Classes',
              href: '/campaigns/c1/classes',
            },
            { label: 'Wizard' },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Lost Mines')).not.toBeInTheDocument()
    expect(screen.queryByText('Campaign')).not.toBeInTheDocument()
  })

  it('renders correct aria-label on the nav', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb crumbs={[{ label: 'Profile' }]} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AppBreadcrumb
          crumbs={[
            {
              label: 'Classes',
              href: '/campaigns/c1/classes',
            },
            { label: 'Wizard' },
          ]}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
