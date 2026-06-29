import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'

import { sampleEpic } from '../../epics/test-fixtures'

import { TicketCard } from './ticket-card'
import { blockedSampleTicket, sampleTicket } from '../test-fixtures'
import { BLOCKED_TICKET_ARIA_LABEL } from '../lib/ticket-card-labels'

function renderCard(props: ComponentProps<typeof TicketCard>) {
  return render(
    <MemoryRouter>
      <TicketCard {...props} />
    </MemoryRouter>,
  )
}

describe('TicketCard', () => {
  it('renders key, title, badges, and epic badge', () => {
    renderCard({
      ticket: sampleTicket,
      epic: { id: sampleEpic.id, title: 'Core platform', badgeColor: '#2563eb' },
      onSelect: vi.fn(),
    })

    expect(screen.getByText('BENCH-001')).toBeInTheDocument()
    expect(screen.getByText('Add ticket CRUD UI')).toBeInTheDocument()
    expect(screen.getByText('Feat')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Core platform')).toBeInTheDocument()
  })

  it('shows blocked indicator when blockers exist', () => {
    renderCard({ ticket: blockedSampleTicket, onSelect: vi.fn() })
    expect(screen.getByRole('button', { name: BLOCKED_TICKET_ARIA_LABEL })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderCard({ ticket: sampleTicket, onSelect: vi.fn() })
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
