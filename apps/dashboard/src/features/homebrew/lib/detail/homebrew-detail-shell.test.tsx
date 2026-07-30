import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HomebrewDetailFallback } from './homebrew-detail-fallback'
import { HomebrewDetailMain } from './homebrew-detail-main'
import { HomebrewDetailShell } from './homebrew-detail-shell'

describe('HomebrewDetailFallback', () => {
  it('renders a full-page unknown fallback with a hub back link', () => {
    render(
      <MemoryRouter>
        <HomebrewDetailFallback
          status="unknown"
          heading="Vocabulary"
          message="This vocabulary set is not available."
          campaignId="camp_1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Vocabulary' })).toBeInTheDocument()
    expect(screen.getByText('This vocabulary set is not available.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Homebrew' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew',
    )
    expect(screen.queryByRole('heading', { name: 'Not available yet' })).not.toBeInTheDocument()
  })

  it('renders disabled copy without a hub back link', () => {
    render(
      <HomebrewDetailFallback
        status="disabled"
        heading="Damage Types"
        message="This set is not implemented yet."
      />,
    )

    expect(screen.getByRole('heading', { name: 'Damage Types' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Not available yet' })).toBeInTheDocument()
    expect(screen.getByText('This set is not implemented yet.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Back to Homebrew' })).not.toBeInTheDocument()
  })
})

describe('HomebrewDetailMain', () => {
  it('stacks main-column sections for hub detail pages', () => {
    render(
      <HomebrewDetailMain>
        <h1>Section title</h1>
        <p>Section body</p>
      </HomebrewDetailMain>,
    )

    expect(screen.getByRole('heading', { name: 'Section title' })).toBeInTheDocument()
    expect(screen.getByText('Section body')).toBeInTheDocument()
  })
})

describe('HomebrewDetailShell', () => {
  it('renders hub nav alongside main content', () => {
    render(
      <HomebrewDetailShell nav={<nav aria-label="Test hub nav">Hub nav</nav>}>
        <p>Ready content</p>
      </HomebrewDetailShell>,
    )

    expect(screen.getByRole('navigation', { name: 'Test hub nav' })).toBeInTheDocument()
    expect(screen.getByText('Ready content')).toBeInTheDocument()
  })

  it('composes disabled fallback inside the shell so nav stays visible', () => {
    render(
      <HomebrewDetailShell nav={<nav aria-label="Test hub nav">Hub nav</nav>}>
        <HomebrewDetailFallback
          status="disabled"
          heading="Damage Types"
          message="This set is not implemented yet."
        />
      </HomebrewDetailShell>,
    )

    expect(screen.getByRole('navigation', { name: 'Test hub nav' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Not available yet' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Back to Homebrew' })).not.toBeInTheDocument()
  })
})
