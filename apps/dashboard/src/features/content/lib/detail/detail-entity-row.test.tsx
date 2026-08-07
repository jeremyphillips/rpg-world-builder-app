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
    expect(
      screen.getByRole('link', { name: 'The Silver Eel' }).parentElement?.parentElement,
    ).toHaveTextContent('The Silver Eel·Building · Tavern')
    expect(screen.getByText('Building · Tavern')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('px-4', 'py-2')
  })

  it('keeps the leading separator visible beside a non-shrinking entity name', () => {
    render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Braggi"
          href="/characters/braggi"
          headingSuffix=" · NPC · Human · Level 3 Fighter"
        />
      </MemoryRouter>,
    )

    const headingRow = screen.getByRole('link', { name: 'Braggi' }).parentElement?.parentElement
    expect(headingRow).toHaveTextContent('Braggi·NPC · Human · Level 3 Fighter')
    expect(screen.getByText('NPC · Human · Level 3 Fighter')).toBeInTheDocument()
    expect(headingRow?.querySelector('[aria-hidden="true"]')).toHaveTextContent('·')
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

    const suffix = container.querySelector('[class*="flex-1"][class*="truncate"]')
    expect(suffix).toHaveClass('truncate')
    expect(screen.getByRole('link', { name: 'Verna Stormcaller' })).toHaveClass('text-link')
    expect(screen.getByRole('link', { name: 'Verna Stormcaller' }).parentElement).toHaveClass(
      'shrink-0',
    )
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
