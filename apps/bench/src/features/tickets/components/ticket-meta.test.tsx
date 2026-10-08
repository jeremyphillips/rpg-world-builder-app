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

    const link = screen.getByRole('link', { name: `Open ${sampleTicket.key} full page` })
    expect(link).toHaveAttribute('href', `/bench/tickets/${sampleTicket.id}`)
    expect(link.querySelector('svg')).toHaveClass('size-icon-inline')
    expect(link.querySelector('svg')).not.toHaveClass('size-3.5')
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
