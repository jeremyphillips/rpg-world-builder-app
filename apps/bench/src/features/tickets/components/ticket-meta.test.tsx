import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <TicketMeta ticket={sampleTicket} detailHref={`/bench/tickets/${sampleTicket.id}`} />
      </MemoryRouter>,
    )
    await expectNoAxeViolations(container)
  })
})
