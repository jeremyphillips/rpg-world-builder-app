import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'

import { sampleTicket } from '../test-fixtures'

import { TicketMeta } from './ticket-meta'

describe('TicketMeta', () => {
  it('renders key, title, and timestamps', () => {
    render(
      <MemoryRouter>
        <TicketMeta ticket={sampleTicket} />
      </MemoryRouter>,
    )

    expect(screen.getByText(sampleTicket.key)).toBeInTheDocument()
    expect(screen.getByText(sampleTicket.title)).toBeInTheDocument()
    expect(screen.getByText(/Created/i)).toBeInTheDocument()
  })

  it('renders detail link when detailHref is provided', () => {
    render(
      <MemoryRouter>
        <TicketMeta ticket={sampleTicket} detailHref={`/bench/tickets/${sampleTicket.id}`} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: `Open ${sampleTicket.key} full page` }),
    ).toHaveAttribute('href', `/bench/tickets/${sampleTicket.id}`)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <TicketMeta ticket={sampleTicket} detailHref={`/bench/tickets/${sampleTicket.id}`} />
      </MemoryRouter>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
