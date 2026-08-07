import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DetailEntityRow } from './detail-entity-row.client'

describe('DetailEntityRow', () => {
  it('renders heading link, subheading, and end slot with row padding', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="The Silver Eel"
          href="/locations/silver-eel"
          subheading="Building · Tavern"
          endSlot={<button type="button">Actions</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'The Silver Eel' })).toHaveAttribute(
      'href',
      '/locations/silver-eel',
    )
    expect(screen.getByText('Building · Tavern')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('px-4', 'py-2')
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
