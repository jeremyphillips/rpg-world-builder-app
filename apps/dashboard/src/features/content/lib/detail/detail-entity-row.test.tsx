import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DetailEntityRow } from './detail-entity-row.client'

describe('DetailEntityRow', () => {
  it('renders heading link, inline heading suffix, and end slot with row padding', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="The Silver Eel"
          href="/locations/silver-eel"
          headingSuffix=" · Building · Tavern"
          endSlot={<button type="button">Actions</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'The Silver Eel' })).toHaveAttribute(
      'href',
      '/locations/silver-eel',
    )
    expect(screen.getByRole('link', { name: 'The Silver Eel' }).parentElement).toHaveTextContent(
      'The Silver Eel · Building · Tavern',
    )
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('px-4', 'py-2')
  })

  it('truncates the heading suffix before the entity name', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Verna Stormcaller"
          href="/characters/verna"
          headingSuffix=" · PC · Elf (Drow) · Level 8 · Fighter 5 (Battle Master) / Rogue 3 (Assassin)"
          endSlot={<button type="button">Actions</button>}
        />
      </MemoryRouter>,
    )

    const suffix = container.querySelector('[class*="text-muted-foreground"]')
    expect(suffix).toHaveClass('truncate')
    expect(screen.getByRole('link', { name: 'Verna Stormcaller' })).toHaveClass('shrink-0')
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
  })

  it('omits end slot when not provided', () => {
    render(
      <MemoryRouter>
        <DetailEntityRow heading="Harborford" href="/locations/harborford" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harborford' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
