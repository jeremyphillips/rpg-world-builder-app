import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { SearchResultRow } from './search-result-row.client'

describe('SearchResultRow', () => {
  it('renders presentation fields and navigates via link', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
      />,
    )

    const link = screen.getByRole('link', { name: 'Fireball, Spell' })
    expect(link).toHaveAttribute('href', '/campaigns/c1/spells/fireball')
    expect(screen.getByText('3rd-level evocation')).toBeInTheDocument()
    expect(screen.getByText('Spell')).toBeInTheDocument()
  })

  it('calls onActivate when clicked', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()

    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary=""
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        onActivate={onActivate}
      />,
    )

    await user.click(screen.getByRole('link', { name: 'Fireball, Spell' }))
    expect(onActivate).toHaveBeenCalledOnce()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
